import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { Pager, qs, SearchForm } from "@/components/admin/pager";
import { serverApi } from "@/lib/api-server";
import { cn } from "@/lib/utils";

type Locale = "id" | "en";
const STATUSES = ["PENDING", "PAID", "FAILED", "EXPIRED", "REFUNDED"] as const;
type Status = (typeof STATUSES)[number];
const statusStyle: Record<Status, string> = {
  PAID: "bg-success/12 text-success",
  PENDING: "bg-muted text-foreground",
  FAILED: "bg-destructive/10 text-destructive",
  EXPIRED: "bg-muted text-muted-foreground",
  REFUNDED: "bg-muted text-muted-foreground",
};

export async function generateMetadata({ params }: PageProps<"/[locale]/admin/orders">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale as Locale, namespace: "Admin" });
  return { title: t("nav.orders") };
}

export default async function AdminOrders({ params, searchParams }: PageProps<"/[locale]/admin/orders">) {
  const locale = (await params).locale as Locale;
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : undefined;
  const status = STATUSES.find((s) => s === sp.status);
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);
  const [t, format, res] = await Promise.all([
    getTranslations({ locale, namespace: "Admin" }),
    getFormatter({ locale }),
    (await serverApi()).api.admin.orders.get({ query: { q, status, page, limit: 20 } }),
  ]);
  if (res.error) throw new Error(`admin orders failed: ${res.error.status}`);
  const { orders, total, limit } = res.data;
  const date = (d: Date | string) =>
    format.dateTime(new Date(d), { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <SearchForm q={q} placeholder={t("searchOrders")} button={t("search")}>
        <select
          name="status"
          defaultValue={status ?? ""}
          aria-label={t("colStatus")}
          className="h-10 rounded-xl border bg-card px-3 text-[16px] sm:text-[0.9rem]"
        >
          <option value="">{t("allStatuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
      </SearchForm>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">{t("none")}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[760px] border-collapse text-left text-[0.86rem]">
            <thead className="bg-muted/60 text-[0.8rem] text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-semibold">{t("colStatus")}</th>
                <th className="px-4 py-2.5 font-semibold">{t("colCreated")}</th>
                <th className="px-4 py-2.5 font-semibold">{t("colUser")}</th>
                <th className="px-4 py-2.5 text-right font-semibold">{t("colAmount")}</th>
                <th className="px-4 py-2.5 font-semibold">{t("colMethod")}</th>
                <th className="px-4 py-2.5 font-semibold">ID</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderId} className="border-t">
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[0.76rem] font-semibold whitespace-nowrap",
                        statusStyle[o.status],
                      )}
                    >
                      {t(`status.${o.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{date(o.createdAt)}</td>
                  <td className="max-w-[16rem] truncate px-4 py-2.5" title={o.user.email}>
                    {o.user.email}
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap tabular-nums">
                    Rp{o.amount.toLocaleString(locale === "id" ? "id-ID" : "en-US")}
                  </td>
                  <td className="px-4 py-2.5 capitalize">{o.paymentType?.replaceAll("_", " ") ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-[0.76rem] whitespace-nowrap">{o.orderId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager
        page={page}
        limit={limit}
        total={total}
        href={(p) => `/admin/orders${qs({ q, status, page: p })}`}
        labels={{ prev: t("prev"), next: t("next"), summary: t.raw("pageOf") as string }}
      />
    </div>
  );
}
