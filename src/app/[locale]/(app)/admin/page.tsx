import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Link } from "@/i18n/navigation";
import { serverApi } from "@/lib/api-server";
import { cn } from "@/lib/utils";

type Locale = "id" | "en";
const RANGES = [7, 30, 90] as const;

export async function generateMetadata({ params }: PageProps<"/[locale]/admin">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale as Locale, namespace: "Admin" });
  return { title: t("nav.overview") };
}

export default async function AdminOverview({ params, searchParams }: PageProps<"/[locale]/admin">) {
  const locale = (await params).locale as Locale;
  const raw = Number((await searchParams).days);
  const days = RANGES.includes(raw as (typeof RANGES)[number]) ? raw : 30;
  const [t, res] = await Promise.all([
    getTranslations({ locale, namespace: "Admin" }),
    (await serverApi()).api.admin.stats.get({ query: { days } }),
  ]);
  if (res.error) throw new Error(`admin stats failed: ${res.error.status}`);
  const s = res.data;
  const rupiah = (n: number) => `Rp${n.toLocaleString(locale === "id" ? "id-ID" : "en-US")}`;

  const kpis = [
    {
      label: t("kpi.revenueWindow", { days }),
      value: rupiah(s.revenue.window),
      note: t("kpi.orders", { count: s.revenue.windowOrders }),
    },
    {
      label: t("kpi.revenueAll"),
      value: rupiah(s.revenue.allTime),
      note: t("kpi.orders", { count: s.revenue.allTimeOrders }),
    },
    { label: t("kpi.activePasses"), value: s.users.activePasses.toLocaleString(), note: null },
    {
      label: t("kpi.users"),
      value: s.users.total.toLocaleString(),
      note: t("kpi.newUsers", { count: s.users.newInWindow, days }),
    },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8">
      <nav
        aria-label={t("range")}
        className="flex items-center gap-1 justify-self-start rounded-full border bg-card p-1 text-[0.85rem]"
      >
        {RANGES.map((r) => (
          <Link
            key={r}
            href={`/admin?days=${r}`}
            aria-current={r === days ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1",
              r === days ? "bg-muted font-semibold" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t("days", { count: r })}
          </Link>
        ))}
      </nav>

      <dl className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="grid gap-1 rounded-[20px] border bg-card p-5">
            <dt className="text-[0.82rem] text-muted-foreground">{k.label}</dt>
            <dd className="text-[1.7rem] leading-tight font-semibold tracking-[-0.02em] tabular-nums">{k.value}</dd>
            {k.note && <dd className="text-[0.8rem] text-muted-foreground">{k.note}</dd>}
          </div>
        ))}
      </dl>

      <RevenueChart
        // Eden turns date-like strings into Date objects; the chart wants "YYYY-MM-DD" (a Jakarta day).
        days={s.revenue.daily.map((d) => ({ ...d, date: new Date(d.date).toISOString().slice(0, 10) }))}
        locale={locale}
        labels={{
          title: t("chartTitle"),
          empty: t("chartEmpty"),
          orders: t.raw("tooltipOrders") as string,
          showTable: t("showTable"),
          date: t("colDate"),
          revenue: t("colRevenue"),
          ordersCol: t("colOrders"),
        }}
      />

      <section aria-labelledby="lesson-stats" className="grid gap-4">
        <h2 id="lesson-stats" className="text-[1.25rem] font-semibold tracking-[-0.02em]">
          {t("lessonsTitle")}
        </h2>
        <div className="max-h-[560px] overflow-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[620px] border-collapse text-left text-[0.88rem]">
            <thead className="sticky top-0 bg-muted text-[0.8rem] text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-semibold">{t("colLesson")}</th>
                <th className="px-4 py-2.5 font-semibold">{t("colStage")}</th>
                <th className="px-4 py-2.5 text-right font-semibold">{t("colCompletions")}</th>
                <th className="px-4 py-2.5 text-right font-semibold">{t("colQuiz")}</th>
                <th className="px-4 py-2.5 text-right font-semibold">{t("colScore")}</th>
              </tr>
            </thead>
            <tbody>
              {s.lessons.map((l) => (
                <tr key={l.slug} className="border-t">
                  <td className="px-4 py-2">
                    <Link href={`/lessons/${l.slug}`} className="hover:underline">
                      {l.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 tabular-nums">{l.stage}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{l.completions}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{l.quizAttempts}</td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {l.avgQuizScore === null ? "—" : `${Math.round(l.avgQuizScore)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
