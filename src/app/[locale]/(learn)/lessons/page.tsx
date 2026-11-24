import { Clock, Lock } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { getLessonIndex } from "@/lib/lessons";

type Locale = "id" | "en";

export async function generateMetadata({ params }: PageProps<"/[locale]/lessons">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale as Locale, namespace: "Lessons" });
  return { title: t("title"), description: t("body") };
}

export default async function LessonsPage({ params }: PageProps<"/[locale]/lessons">) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Lessons" });
  return (
    <div className="grid gap-10">
      <div className="grid max-w-[640px] gap-3">
        <h1 className="text-[clamp(2rem,4vw,2.6rem)] leading-tight font-semibold tracking-[-0.035em]">{t("title")}</h1>
        <p className="text-[1.05rem] text-muted-foreground">{t("body")}</p>
      </div>
      {/* Locked flags depend on the visitor's pass, so the list streams in per request. */}
      <Suspense fallback={<p className="text-muted-foreground">{t("loading")}</p>}>
        <LessonList locale={locale} />
      </Suspense>
    </div>
  );
}

async function LessonList({ locale }: { locale: Locale }) {
  const [t, index] = await Promise.all([getTranslations({ locale, namespace: "Lessons" }), getLessonIndex(locale)]);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-12">
      {index.stages.map((stage) => {
        const count = stage.modules.reduce((n, m) => n + m.lessons.length, 0);
        return (
          <section
            key={stage.stage}
            aria-labelledby={`stage-${stage.stage}`}
            className="grid grid-cols-[minmax(0,1fr)] gap-5"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[0.72rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {t("stage", { number: stage.stage })}
              </span>
              <h2 id={`stage-${stage.stage}`} className="text-[1.5rem] font-semibold tracking-[-0.02em]">
                {stage.title}
              </h2>
              <span className="text-sm text-muted-foreground">{t("lessonsCount", { count })}</span>
              {stage.isFree && (
                <span className="rounded-full bg-highlight px-2.5 py-0.5 text-[0.7rem] font-semibold text-highlight-foreground">
                  {t("free")}
                </span>
              )}
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))]">
              {stage.modules.map((mod) => (
                <div key={mod.id} className="rounded-[20px] border bg-card p-5">
                  <h3 className="mb-3 font-semibold">{mod.title}</h3>
                  <ol className="grid grid-cols-[minmax(0,1fr)] gap-1">
                    {mod.lessons.map((lesson) => (
                      <li key={lesson.slug}>
                        <Link
                          href={`/lessons/${lesson.slug}`}
                          className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-[0.93rem] hover:bg-muted"
                        >
                          <span className="min-w-0 truncate">{lesson.title}</span>
                          <span className="flex shrink-0 items-center gap-2 text-[0.8rem] text-muted-foreground">
                            {lesson.locked ? (
                              <Lock className="size-3.5" aria-label={t("locked")} />
                            ) : (
                              <>
                                <Clock className="size-3.5" aria-hidden />
                                {t("minutes", { count: lesson.estimatedMinutes })}
                              </>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
