import { ArrowLeft, Check, Flame, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { brand } from "@/config/brand";
import { Link } from "@/i18n/navigation";

/** Split layout for auth pages: brand panel on wide screens, the form on the right. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Auth");
  const cta = useTranslations("Cta");
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Fixed colors: the same panel in light and dark mode, like the landing CTA. */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex"
        style={{ background: "var(--gradient-ink)" }}
      >
        <Link href="/" className="flex w-fit items-center gap-2.5 text-lg font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-full bg-white font-mono text-[0.78rem] font-semibold text-ink">
            py
          </span>
          {brand.name}
        </Link>
        <div className="grid max-w-md gap-4">
          <h2 className="text-[2.2rem] leading-[1.08] font-semibold tracking-[-0.035em]">{t("asideTitle")}</h2>
          <p className="text-white/70">{t("asideBody")}</p>
        </div>
        <div aria-hidden className="grid max-w-sm gap-3">
          <div className="rounded-2xl bg-ink/80 p-4 text-[0.88rem] shadow-xl">
            <p className="flex items-center gap-2 font-mono text-[0.75rem] text-ink-muted">
              <Play className="size-3" /> {cta("ran")}
            </p>
            <p className="mt-1.5 font-mono">Total Rp 59,500</p>
          </div>
          <div className="ml-8 rounded-2xl bg-white p-4 text-[0.88rem] text-[#0f172a] shadow-xl">
            <p className="flex items-center gap-2 font-semibold">
              <Check className="size-4 text-[#15803d]" /> {cta("quizDone")}
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full bg-ink/80 px-4 py-2 text-[0.82rem] shadow-xl">
            <Flame className="size-4 text-ink-accent" /> {cta("streak")}
          </div>
        </div>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-8">
        <Link
          href="/"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> {t("backHome")}
        </Link>
        <div className="mx-auto grid w-full max-w-[400px] flex-1 content-center py-10">{children}</div>
      </main>
    </div>
  );
}

export function AuthHeading({ title, body }: { title: string; body?: React.ReactNode }) {
  return (
    <div className="mb-7 grid gap-2">
      <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.03em]">{title}</h1>
      {body && <p className="leading-relaxed text-muted-foreground">{body}</p>}
    </div>
  );
}
