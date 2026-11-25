import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { AccessForm } from "@/components/admin/access-form";
import { Pager, qs, SearchForm } from "@/components/admin/pager";
import { serverApi } from "@/lib/api-server";

type Locale = "id" | "en";

export async function generateMetadata({ params }: PageProps<"/[locale]/admin/users">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale as Locale, namespace: "Admin" });
  return { title: t("nav.users") };
}

export default async function AdminUsers({ params, searchParams }: PageProps<"/[locale]/admin/users">) {
  const locale = (await params).locale as Locale;
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : undefined;
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);
  const [t, format, res] = await Promise.all([
    getTranslations({ locale, namespace: "Admin" }),
    getFormatter({ locale }),
    (await serverApi()).api.admin.users.get({ query: { q, page, limit: 20 } }),
  ]);
  if (res.error) throw new Error(`admin users failed: ${res.error.status}`);
  const { users, total, limit } = res.data;
  const date = (d: Date | string) => format.dateTime(new Date(d), { dateStyle: "medium", timeZone: "Asia/Jakarta" });
  const now = new Date();
  const formLabels = {
    grant: t("grant"),
    revoke: t("revoke"),
    daysLabel: t("daysLabel"),
    reasonLabel: t("reasonLabel"),
    reasonPlaceholder: t("reasonPlaceholder"),
    saving: t("saving"),
    saved: t("saved"),
    failed: t("failed"),
    revokeConfirm: t("revokeConfirm"),
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <SearchForm q={q} placeholder={t("searchUsers")} button={t("search")} />
      {users.length === 0 ? (
        <p className="text-muted-foreground">{t("none")}</p>
      ) : (
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-3">
          {users.map((u) => {
            const until = u.accessUntil ? new Date(u.accessUntil) : null;
            const access =
              u.role === "ADMIN"
                ? t("admin")
                : until && until > now
                  ? t("accessUntil", { date: date(until) })
                  : until
                    ? t("expired", { date: date(until) })
                    : t("noAccess");
            return (
              <li key={u.id} className="rounded-2xl border bg-card px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <div className="max-w-full min-w-0">
                    <p className="truncate font-semibold">{u.name}</p>
                    <p className="truncate text-[0.85rem] text-muted-foreground">
                      {u.email} · {u.emailVerified ? t("verified") : t("unverified")} · {u.locale.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[0.82rem]">
                    <span
                      className={
                        u.hasAccess
                          ? "rounded-full bg-success/12 px-2.5 py-0.5 font-semibold text-success"
                          : "rounded-full bg-muted px-2.5 py-0.5 font-semibold"
                      }
                    >
                      {access}
                    </span>
                    <span className="text-muted-foreground">
                      {t("colJoined")}: {date(u.createdAt)}
                    </span>
                  </div>
                </div>
                {u.role !== "ADMIN" && (
                  <details className="mt-2 border-t pt-2">
                    <summary className="cursor-pointer text-[0.85rem] font-semibold text-primary-text">
                      {t("manage")}
                    </summary>
                    <AccessForm userId={u.id} canRevoke={u.hasAccess} labels={formLabels} />
                  </details>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <Pager
        page={page}
        limit={limit}
        total={total}
        href={(p) => `/admin/users${qs({ q, page: p })}`}
        labels={{ prev: t("prev"), next: t("next"), summary: t.raw("pageOf") as string }}
      />
    </div>
  );
}
