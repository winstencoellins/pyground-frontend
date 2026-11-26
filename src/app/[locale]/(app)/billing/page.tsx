import { Check, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { PassPrice } from "@/components/landing/pass-price";
import { Link } from "@/i18n/navigation";
import { serverApi } from "@/lib/api-server";
import { getMe } from "@/lib/session";
import { cn } from "@/lib/utils";

type Locale = "id" | "en";

export async function generateMetadata({ params }: PageProps<"/[locale]/billing">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale as Locale, namespace: "Billing" });
  return { title: t("title"), robots: { index: false } };
}

const statusStyle = {
  PAID: "bg-success/12 text-success",
  PENDING: "bg-muted text-foreground",
  FAILED: "bg-destructive/10 text-destructive",
  EXPIRED: "bg-muted text-muted-foreground",
  REFUNDED: "bg-muted text-muted-foreground",
} as const;

export default async function BillingPage({ params }: PageProps<"/[locale]/billing">) {
  const locale = (await params).locale as Locale;
  const [t, tp, format, me, orders] = await Promise.all([
    getTranslations({ locale, namespace: "Billing" }),
    getTranslations({ locale, namespace: "Pricing" }),
    getFormatter({ locale }),
    getMe(),
    (await serverApi()).api.payments.orders.get(),
  ]);
  const date = (d: Date | string) => format.dateTime(new Date(d), { dateStyle: "long", timeZone: "Asia/Jakarta" });
  const accessUntil = me?.accessUntil ? new Date(me.accessUntil) : null;
  const active = accessUntil !== null && accessUntil > new Date();
  const status =
    me?.role === "ADMIN"
      ? t("statusAdmin")
      : active
        ? t("statusActive", { date: date(accessUntil) })
        : accessUntil
          ? t("statusExpired", { date: date(accessUntil) })
          : t("statusFree");
  const list = orders.data ?? [];
  const rupiah = (n: number) => `Rp${n.toLocaleString(locale === "id" ? "id-ID" : "en-US")}`;
  const badge = (o: (typeof list)[number]) =>
    o.status === "PENDING" ? (
      // A pending order (e.g. a virtual account not paid yet) links back to its status page.
      <Link
        href={`/payment/result?orderId=${o.orderId}`}
        className={cn(
          "rounded-full px-2.5 py-0.5 text-[0.78rem] font-semibold whitespace-nowrap underline-offset-2 hover:underline",
          statusStyle.PENDING,
        )}
      >
        {t("status.PENDING")} →
      </Link>
    ) : (
      <span
        className={cn(
          "rounded-full px-2.5 py-0.5 text-[0.78rem] font-semibold whitespace-nowrap",
          statusStyle[o.status],
        )}
      >
        {t(`status.${o.status}`)}
      </span>
    );

  return (
    <div className="grid max-w-[860px] grid-cols-[minmax(0,1fr)] gap-10">
      <header className="grid gap-2">
        <h1 className="text-[clamp(2rem,4vw,2.6rem)] leading-tight font-semibold tracking-[-0.035em]">{t("title")}</h1>
        <p className="text-muted-foreground">{t("body")}</p>
      </header>

      <section className="grid gap-6 rounded-[24px] border bg-card p-6 sm:p-8">
        <p
          className={cn(
            "w-fit rounded-full px-3 py-1 text-[0.88rem] font-semibold",
            active ? statusStyle.PAID : "bg-muted",
          )}
        >
          {status}
        </p>
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="grid content-start gap-3">
            <h2 className="font-semibold text-highlight-text">{t("passName")}</h2>
            <p className="flex items-baseline gap-1.5">
              <b className="text-[2.4rem] leading-none font-semibold tracking-tight tabular-nums">
                <Suspense
                  fallback={<span className="inline-block h-[0.8em] w-[4.5em] animate-pulse rounded-lg bg-muted" />}
                >
                  <PassPrice locale={locale} fallback={tp("pass.priceFallback")} />
                </Suspense>
              </b>
              <span className="text-sm text-muted-foreground">{t("period")}</span>
            </p>
            <ul className="mt-1 grid gap-2 text-[0.92rem]">
              {(tp.raw("pass.features") as string[]).map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid content-start gap-4">
            {me?.role !== "ADMIN" && (
              <CheckoutButton
                label={active ? t("extend") : t("buy")}
                labels={{ redirecting: t("redirecting"), failed: t("checkoutFailed") }}
              />
            )}
            {active && <p className="text-[0.88rem] text-muted-foreground">{t("extendNote")}</p>}
            <p className="text-[0.82rem] text-muted-foreground">{tp("methods")}</p>
            <p className="flex items-center gap-2 text-[0.85rem] text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0" aria-hidden /> {t("processedBy")}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="orders-title" className="grid gap-4">
        <h2 id="orders-title" className="text-[1.3rem] font-semibold tracking-[-0.02em]">
          {t("ordersTitle")}
        </h2>
        {list.length === 0 ? (
          <p className="text-muted-foreground">{t("noOrders")}</p>
        ) : (
          <>
            {/* Phones: one card per order, status first; tablets and up: the table. */}
            <ul className="grid gap-3 sm:hidden">
              {list.map((o) => (
                <li key={o.orderId} className="grid gap-1.5 rounded-2xl border bg-card px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold tabular-nums">{rupiah(o.amount)}</span>
                    {badge(o)}
                  </div>
                  <p className="text-[0.85rem] text-muted-foreground">
                    {date(o.paidAt ?? o.createdAt)}
                    {o.paymentType && <span className="capitalize"> · {o.paymentType.replaceAll("_", " ")}</span>}
                  </p>
                  <p className="font-mono text-[0.75rem] break-all text-muted-foreground">{o.orderId}</p>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto rounded-2xl border bg-card sm:block">
              <table className="w-full min-w-[560px] border-collapse text-left text-[0.9rem]">
                <thead>
                  <tr className="border-b bg-muted/60 text-[0.8rem] text-muted-foreground">
                    <th className="px-4 py-2.5 font-semibold">{t("colDate")}</th>
                    <th className="px-4 py-2.5 font-semibold">{t("colOrder")}</th>
                    <th className="px-4 py-2.5 font-semibold">{t("colAmount")}</th>
                    <th className="px-4 py-2.5 font-semibold">{t("colMethod")}</th>
                    <th className="px-4 py-2.5 font-semibold">{t("colStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((o) => (
                    <tr key={o.orderId} className="border-b last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap">{date(o.paidAt ?? o.createdAt)}</td>
                      <td className="px-4 py-3 font-mono text-[0.8rem] whitespace-nowrap">{o.orderId}</td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums">{rupiah(o.amount)}</td>
                      <td className="px-4 py-3 capitalize">{o.paymentType?.replaceAll("_", " ") ?? "—"}</td>
                      <td className="px-4 py-3">{badge(o)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
