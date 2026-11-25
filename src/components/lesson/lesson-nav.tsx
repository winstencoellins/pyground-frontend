import { ArrowLeft, ArrowRight, Check, ChevronDown, Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { getLessonIndex } from "@/lib/lessons";
import { cn } from "@/lib/utils";

type Index = Awaited<ReturnType<typeof getLessonIndex>>;
type Stage = Index["stages"][number];

/** Every lesson in curriculum order, for prev/next. */
export function flatLessons(index: Index) {
  return index.stages.flatMap((s) => s.modules.flatMap((m) => m.lessons));
}

export function stageOf(index: Index, slug: string) {
  return index.stages.find((s) => s.modules.some((m) => m.lessons.some((l) => l.slug === slug)));
}

/** The current stage's lessons: a sticky sidebar on large screens, a collapsible list above the lesson on small ones. */
export async function StageNav({
  locale,
  stage,
  slug,
  completed,
}: {
  locale: Locale;
  stage: Stage;
  slug: string;
  /** Completed slugs, or null when signed out (no ticks or progress shown). */
  completed: Set<string> | null;
}) {
  const t = await getTranslations({ locale, namespace: "Lessons" });
  const lessons = stage.modules.flatMap((m) => m.lessons);
  const done = completed ? lessons.filter((l) => completed.has(l.slug)).length : 0;

  const heading = (
    <span className="grid gap-0.5">
      <span className="text-[0.7rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {t("stage", { number: stage.stage })}
      </span>
      <span className="font-semibold">{stage.title}</span>
    </span>
  );
  const progress = completed && (
    <div className="grid gap-1.5">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={lessons.length}
        aria-valuenow={done}
        aria-label={t("stageProgress", { done, total: lessons.length })}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-success" style={{ width: `${(done / lessons.length) * 100}%` }} />
      </div>
      <p className="text-[0.78rem] text-muted-foreground">{t("stageProgress", { done, total: lessons.length })}</p>
    </div>
  );
  const list = (
    <div className="grid gap-4">
      {stage.modules.map((mod) => (
        <div key={mod.id} className="grid gap-1">
          <p className="px-2 text-[0.75rem] font-semibold text-muted-foreground">{mod.title}</p>
          <ol className="grid gap-0.5">
            {mod.lessons.map((lesson) => {
              const current = lesson.slug === slug;
              const isDone = completed?.has(lesson.slug);
              return (
                <li key={lesson.slug}>
                  <Link
                    href={`/lessons/${lesson.slug}`}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[0.88rem] outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/50",
                      current && "bg-primary/10 font-semibold text-primary-text hover:bg-primary/10",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-full border",
                        isDone && "border-success bg-success text-background",
                        current && !isDone && "border-primary",
                      )}
                    >
                      {isDone && <Check className="size-2.5" strokeWidth={3.5} aria-label={t("doneLabel")} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                    {lesson.locked && (
                      <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-label={t("locked")} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <aside
        data-stage-nav
        className="hidden content-start gap-5 lg:sticky lg:top-24 lg:grid lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto lg:pr-2"
      >
        {heading}
        {progress}
        <nav aria-label={t("contents")}>{list}</nav>
      </aside>
      <details className="group rounded-2xl border bg-card lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
          {heading}
          <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="grid gap-4 border-t px-2 pt-3 pb-3">
          {progress && <div className="px-2">{progress}</div>}
          <nav aria-label={t("contents")}>{list}</nav>
        </div>
      </details>
    </>
  );
}

/** Previous / next lesson in curriculum order. Locked neighbours still link (their page explains the lock). */
export async function PrevNext({ locale, index, slug }: { locale: Locale; index: Index; slug: string }) {
  const t = await getTranslations({ locale, namespace: "Lessons" });
  const all = flatLessons(index);
  const i = all.findIndex((l) => l.slug === slug);
  const prev = i > 0 ? all[i - 1] : null;
  const next = i >= 0 && i < all.length - 1 ? all[i + 1] : null;
  const card =
    "grid min-w-0 gap-1 rounded-2xl border bg-card px-4 py-3 outline-none hover:border-foreground/40 focus-visible:ring-4 focus-visible:ring-ring/50";
  return (
    <nav aria-label={`${t("prev")} / ${t("next")}`} className="grid grid-cols-2 gap-3">
      {prev ? (
        <Link href={`/lessons/${prev.slug}`} rel="prev" className={card}>
          <span className="flex items-center gap-1 text-[0.78rem] text-muted-foreground">
            <ArrowLeft className="size-3.5" aria-hidden /> {t("prev")}
          </span>
          <span className="truncate text-[0.92rem] font-semibold">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={`/lessons/${next.slug}`} rel="next" className={cn(card, "text-right")}>
          <span className="flex items-center justify-end gap-1 text-[0.78rem] text-muted-foreground">
            {next.locked && <Lock className="size-3" aria-label={t("locked")} />}
            {t("next")} <ArrowRight className="size-3.5" aria-hidden />
          </span>
          <span className="truncate text-[0.92rem] font-semibold">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
