import { ArrowRight, Clock, Flame, Lock, PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { OutlinePill } from "@/components/landing/ui";
import { flatLessons } from "@/components/lesson/lesson-nav";
import { Link } from "@/i18n/navigation";
import { continueLesson } from "@/lib/continue";
import { getLessonIndex, getProgress } from "@/lib/lessons";
import { getMe } from "@/lib/session";
import { cn } from "@/lib/utils";

type Locale = "id" | "en";

export async function generateMetadata({ params }: PageProps<"/[locale]/dashboard">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale as Locale, namespace: "App" });
  return { title: t("dashboard.title"), robots: { index: false } };
}

export default async function DashboardPage({ params }: PageProps<"/[locale]/dashboard">) {
  const locale = (await params).locale as Locale;
  const [t, tl, format, me, index, progress] = await Promise.all([
    getTranslations({ locale, namespace: "App.dashboard" }),
    getTranslations({ locale, namespace: "Lessons" }),
    getFormatter({ locale }),
    getMe(),
    getLessonIndex(locale),
    getProgress(),
  ]);
  // AuthGate already checked the session; progress can still fail to load, so fall back to "nothing done".
  const completed = progress?.completed ?? [];
  const done = new Set(completed.map((c) => c.slug));
  const ordered = flatLessons(index);
  const next = continueLesson(ordered, completed);
  const nextStage = next && index.stages.find((s) => s.modules.some((m) => m.lessons.includes(next)));
  const nextModule = next && nextStage?.modules.find((m) => m.lessons.includes(next));
  const streak = progress?.streak ?? { current: 0, longest: 0, activeToday: false };
  const accessUntil = me?.accessUntil ? new Date(me.accessUntil) : null;
  const hasAccess = me?.role === "ADMIN" || (accessUntil !== null && accessUntil > new Date());

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10">
      <header className="grid gap-2">
        <h1 className="text-[clamp(2rem,4vw,2.6rem)] leading-tight font-semibold tracking-[-0.035em]">
          {t("greeting", { name: me?.name.split(" ")[0] ?? "" })}
        </h1>
        <p className="text-muted-foreground">
          {hasAccess && accessUntil ? (
            t("accessUntil", {
              date: format.dateTime(accessUntil, { dateStyle: "long", timeZone: "Asia/Jakarta" }),
            })
          ) : hasAccess ? null : (
            <>
              {t("accessFree")}{" "}
              <Link href="/#harga" className="font-semibold text-primary-text underline underline-offset-4">
                {t("getAccess")}
              </Link>
            </>
          )}
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Continue where you left off */}
        <section className="grid content-between gap-6 rounded-[24px] bg-band p-6 text-band-foreground sm:p-8">
          {next && nextStage && nextModule ? (
            <>
              <div className="grid gap-2">
                <p className="text-[0.78rem] font-semibold tracking-[0.08em] text-band-muted uppercase">
                  {completed.length ? t("continueLabel") : t("startLabel")}
                </p>
                <h2 className="text-[clamp(1.5rem,3vw,2rem)] leading-tight font-semibold tracking-[-0.02em]">
                  {next.title}
                </h2>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.9rem] text-band-muted">
                  <span>
                    {tl("stage", { number: nextStage.stage })} · {nextModule.title}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden /> {tl("minutes", { count: next.estimatedMinutes })}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/lessons/${next.slug}`}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-band-foreground px-5 text-[0.92rem] font-semibold text-band outline-none focus-visible:ring-4 focus-visible:ring-band-foreground/50"
                >
                  {next.locked && <Lock className="size-4" aria-label={tl("locked")} />}
                  {completed.length ? t("continueCta") : t("startCta")} <ArrowRight className="size-4" aria-hidden />
                </Link>
                {next.locked && (
                  <p className="text-[0.88rem] text-band-muted">
                    {t("lockedHint")}{" "}
                    <Link href="/#harga" className="font-semibold text-band-foreground underline underline-offset-4">
                      {t("seePricing")}
                    </Link>
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="grid gap-4">
              <PartyPopper className="size-8" aria-hidden />
              <h2 className="text-[1.6rem] font-semibold tracking-[-0.02em]">{t("allDone")}</h2>
            </div>
          )}
        </section>

        {/* Streak (#41) */}
        <section className="grid content-start gap-3 rounded-[24px] border bg-card p-6">
          <h2 className="text-[0.78rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {t("streakTitle")}
          </h2>
          <p className="flex items-center gap-2.5 text-[2rem] leading-none font-semibold tracking-[-0.03em]">
            <Flame
              className={cn("size-8", streak.current > 0 ? "text-highlight" : "text-muted-foreground")}
              aria-hidden
            />
            {t("streakDays", { count: streak.current })}
          </p>
          <p className="text-[0.92rem] leading-relaxed">
            {streak.activeToday ? t("streakToday") : streak.current > 0 ? t("streakKeep") : t("streakStart")}
          </p>
          {streak.longest > 0 && (
            <p className="text-[0.85rem] text-muted-foreground">{t("streakLongest", { count: streak.longest })}</p>
          )}
        </section>
      </div>

      {/* Progress per stage */}
      <section aria-labelledby="stages-title" className="grid gap-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="stages-title" className="text-[1.4rem] font-semibold tracking-[-0.02em]">
            {t("stagesTitle")}
          </h2>
          <p className="text-[0.9rem] text-muted-foreground">{t("overall", { percent: progress?.overall ?? 0 })}</p>
        </div>
        <ol className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {index.stages.map((stage) => {
            const lessons = stage.modules.flatMap((m) => m.lessons);
            const count = lessons.filter((l) => done.has(l.slug)).length;
            const locked = lessons.every((l) => l.locked);
            const target = lessons.find((l) => !done.has(l.slug)) ?? lessons[0];
            return (
              <li key={stage.stage}>
                <Link
                  href={`/lessons/${target.slug}`}
                  className="grid h-full gap-3 rounded-[20px] border bg-card p-5 outline-none hover:border-foreground/40 focus-visible:ring-4 focus-visible:ring-ring/50"
                >
                  <span className="flex min-h-6 items-center justify-between gap-2 text-[0.72rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    {tl("stage", { number: stage.stage })}
                    {locked ? (
                      <Lock className="size-3.5" aria-label={tl("locked")} />
                    ) : (
                      stage.isFree && (
                        <span className="rounded-full bg-highlight px-2 py-0.5 tracking-normal text-highlight-foreground normal-case">
                          {tl("free")}
                        </span>
                      )
                    )}
                  </span>
                  <span className="font-semibold">{stage.title}</span>
                  <span
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={lessons.length}
                    aria-valuenow={count}
                    aria-label={`${stage.title}: ${t("stageCount", { done: count, total: lessons.length })}`}
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <span
                      className="block h-full rounded-full bg-success"
                      style={{ width: `${(count / lessons.length) * 100}%` }}
                    />
                  </span>
                  <span className="text-[0.85rem] text-muted-foreground">
                    {t("stageCount", { done: count, total: lessons.length })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <OutlinePill href="/lessons">{t("browse")}</OutlinePill>
      </section>
    </div>
  );
}
