import { ArrowLeft, Clock, Languages, Lock } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { Suspense } from "react";
import { CompleteButton } from "@/components/lesson/complete-button";
import { LessonContent } from "@/components/lesson/lesson-content";
import { PrevNext, StageNav, stageOf } from "@/components/lesson/lesson-nav";
import { OutlinePill, PillLink } from "@/components/landing/ui";
import { Link } from "@/i18n/navigation";
import { getLesson, getLessonIndex, getProgress } from "@/lib/lessons";
import { pageMeta } from "@/lib/seo";

type Locale = "id" | "en";
type Params = PageProps<"/[locale]/lessons/[slug]">["params"];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const result = await getLesson(slug, locale as Locale);
  // Locked (paid) lessons aren't indexed: crawlers are signed out and would only see the paywall.
  if (!result.ok) return { robots: { index: false } };
  const { frontmatter: fm, fallbackLocale } = result.lesson;
  return pageMeta({
    locale,
    path: `/lessons/${slug}`,
    title: fm.title,
    description: fm.description,
    // An English URL showing the Indonesian fallback text is a duplicate of the Indonesian page.
    canonicalLocale: fallbackLocale ?? locale,
  });
}

export default async function LessonPage({ params }: { params: Params }) {
  // Root params are known at build time; awaiting `params` here would make the whole page dynamic.
  const t = await getTranslations({ locale: (await rootLocale()) as Locale, namespace: "Lessons" });
  // minmax(0,1fr): wide code blocks scroll inside themselves instead of widening the page.
  return (
    <div className="mx-auto grid w-full max-w-[1080px] grid-cols-[minmax(0,1fr)] gap-8">
      <Link
        href="/lessons"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> {t("back")}
      </Link>
      {/* The lesson (and whether it is locked) depends on the visitor, so it streams in per request. */}
      <Suspense fallback={<p className="text-muted-foreground">{t("loading")}</p>}>
        <Lesson params={params} />
      </Suspense>
    </div>
  );
}

async function Lesson({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const [t, result, index, progress] = await Promise.all([
    getTranslations({ locale: locale as Locale, namespace: "Lessons" }),
    getLesson(slug, locale as Locale),
    getLessonIndex(locale as Locale),
    getProgress(),
  ]);
  const stage = stageOf(index, slug);
  const completed = progress ? new Set(progress.completed.map((c) => c.slug)) : null;
  // Sidebar (stage lessons) next to the lesson column; the lesson text keeps a readable width.
  const withNav = (body: React.ReactNode) => (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
      {stage && <StageNav locale={locale as Locale} stage={stage} slug={slug} completed={completed} />}
      <article className="grid max-w-[720px] grid-cols-[minmax(0,1fr)] gap-8">{body}</article>
    </div>
  );

  if (!result.ok && result.reason === "not-found") {
    return (
      <div className="grid gap-4">
        <h1 className="text-[2rem] font-semibold tracking-[-0.03em]">{t("notFoundTitle")}</h1>
        <p className="text-muted-foreground">{t("notFoundBody")}</p>
        <OutlinePill href="/lessons">{t("back")}</OutlinePill>
      </div>
    );
  }
  if (!result.ok) {
    return withNav(
      <div className="grid gap-4 rounded-[22px] border bg-card p-7">
        <Lock className="size-6 text-highlight" aria-hidden />
        <h1 className="text-[1.6rem] font-semibold tracking-[-0.02em]">{t("lockedTitle")}</h1>
        <p className="leading-relaxed text-muted-foreground">{t("lockedBody")}</p>
        <div className="flex flex-wrap gap-3">
          <PillLink href={`/sign-in?next=${encodeURIComponent(`/lessons/${slug}`)}`}>{t("signIn")}</PillLink>
          <OutlinePill href="/#harga">{t("seePricing")}</OutlinePill>
        </div>
      </div>,
    );
  }

  const { frontmatter: fm, source, fallbackLocale } = result.lesson;
  return withNav(
    <>
      <header className="grid gap-3">
        <p className="text-[0.78rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          {t("stage", { number: fm.stage })} · {fm.module}
        </p>
        <h1 className="text-[clamp(2rem,4.4vw,2.8rem)] leading-[1.08] font-semibold tracking-[-0.035em]">{fm.title}</h1>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" aria-hidden /> {t("minutes", { count: fm.estimatedMinutes })}
        </p>
        {fallbackLocale && (
          <p className="flex items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5 text-[0.88rem]">
            <Languages className="size-4 shrink-0 text-primary-text" aria-hidden /> {t("fallback")}
          </p>
        )}
      </header>
      <div lang={fallbackLocale ?? locale}>
        <LessonContent source={source} locale={locale as Locale} slug={slug} />
      </div>
      <footer className="grid gap-6 border-t pt-8">
        {completed ? (
          <CompleteButton
            slug={slug}
            initiallyDone={completed.has(slug)}
            labels={{
              markComplete: t("markComplete"),
              completed: t("completed"),
              saving: t("saving"),
              completeFailed: t("completeFailed"),
            }}
          />
        ) : (
          <Link
            href={`/sign-in?next=${encodeURIComponent(`/lessons/${slug}`)}`}
            className="w-fit text-[0.92rem] font-semibold text-primary-text underline underline-offset-4"
          >
            {t("signInToTrack")}
          </Link>
        )}
        <PrevNext locale={locale as Locale} index={index} slug={slug} />
      </footer>
    </>,
  );
}
