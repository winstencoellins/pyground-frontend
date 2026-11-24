import { Check, Flame, Languages, ListChecks, Play, Terminal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";
import { DashboardMock } from "./dashboard-mock";
import { passPrice, stageVisuals, type StageShape, type StageStatus } from "./data";
import { LearnTicker } from "./learn-ticker";
import { PlaygroundDemo } from "./playground-demo";
import { Chip, Container, OutlinePill, PillLink, SectionTitle } from "./ui";

// Lists in the message files are read with t.raw(); their shapes are fixed by messages/id.json.
type Item = { title: string; body: string };

/* ---------------------------------------------------------------- hero */

export function Hero() {
  const t = useTranslations("Hero");
  const common = useTranslations("Common");
  const ticker = useTranslations("Ticker");
  const points = [...(t.raw("points") as string[]), common("supportedBy", { name: brand.supportedBy })];

  return (
    <section className="relative overflow-x-clip pt-12 pb-16 lg:pt-16">
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8">
        {/* left: pitch */}
        <div className="grid min-w-0 content-center gap-6">
          <Chip tag={t("chipTag")}>{t("chip")}</Chip>
          <h1 className="text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[1.02] font-semibold tracking-[-0.04em]">
            {t("title")}
          </h1>
          <p className="max-w-[30em] text-[1.05rem] leading-relaxed text-muted-foreground">{t("body")}</p>
          <PillLink href="#harga">{t("cta")}</PillLink>
          <ul className="mt-4 grid gap-1.5 text-sm text-muted-foreground">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Check className="size-4 text-highlight" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* center: the product itself, on a soft glow */}
        <div className="relative min-w-0">
          <div
            aria-hidden
            className="absolute inset-x-[-10%] top-[8%] bottom-[-6%] -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--primary)_22%,transparent),transparent)] blur-2xl"
          />
          <PlaygroundDemo />
        </div>

        {/* right: floating cards + statement */}
        <div className="grid min-w-0 content-between gap-8 lg:self-stretch lg:py-2">
          <LearnTicker label={ticker("label")} items={ticker.raw("items") as string[]} />
          <div className="grid gap-5">
            <div className="rounded-2xl border bg-card p-4 shadow-[0_18px_40px_-24px_rgb(27_29_58/0.45)]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[0.8rem] text-muted-foreground">{t("progressLabel")}</p>
                <p className="text-[1.7rem] leading-none font-semibold tracking-tight tabular-nums">64%</p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[64%] rounded-full bg-primary" />
              </div>
              <p className="mt-2 flex items-center justify-end gap-1 text-[0.75rem] font-semibold text-highlight">
                <Flame className="size-3.5" aria-hidden /> {t("streak", { days: 5 })}
              </p>
            </div>
            <p className="text-[clamp(1.7rem,2.6vw,2.2rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
              {t("statement")}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- topic strip */

export function TopicStrip() {
  const t = useTranslations("Topics");
  return (
    <section aria-labelledby="topics-h" className="pb-20">
      <Container className="grid justify-items-center gap-4">
        <p id="topics-h" className="text-[0.72rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          {t("label")}
        </p>
        <ul className="grid w-full max-w-[860px] grid-cols-2 overflow-hidden rounded-2xl border bg-card sm:grid-cols-4 md:grid-cols-7">
          {(t.raw("items") as string[]).map((item) => (
            <li
              key={item}
              className="flex items-center justify-center gap-2 border-r border-b px-3 py-3.5 text-[0.85rem] font-semibold whitespace-nowrap md:border-b-0 md:last:border-r-0"
            >
              <Terminal className="size-3.5 shrink-0 text-primary-text" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- why */

const featureIcons = [Play, Languages, ListChecks, Flame];
const iconTint = [
  "bg-primary/10 text-primary-text",
  "bg-highlight/10 text-highlight",
  "bg-primary/10 text-primary-text",
  "bg-highlight/10 text-highlight",
];

export function Why() {
  const t = useTranslations("Why");
  return (
    <section id="cara" className="scroll-mt-20 py-16">
      <Container>
        <SectionTitle
          center
          tag={t("tag")}
          label={t("label")}
          title={
            <>
              {t("title1")}
              <br />
              {t("title2")}
            </>
          }
        >
          {t("body")}
        </SectionTitle>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(t.raw("features") as Item[]).map((f, i) => {
            const Icon = featureIcons[i]!;
            return (
              <article key={f.title} className="grid content-start gap-14 rounded-[20px] border bg-card p-5">
                <span className={cn("grid size-11 place-items-center rounded-xl", iconTint[i])}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="grid gap-1.5">
                  <h3 className="text-[1.05rem] font-semibold tracking-tight">{f.title}</h3>
                  <p className="text-[0.9rem] leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- product overview */

export function Overview() {
  const t = useTranslations("Overview");
  return (
    <section className="overflow-x-clip py-16">
      <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="grid gap-7">
          <SectionTitle tag={t("tag")} label={t("label")} title={t("title")}>
            {t("body")}
          </SectionTitle>
          <PillLink href="#harga">{t("cta")}</PillLink>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.88rem]">
            {(t.raw("points") as string[]).map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="grid size-4 place-items-center rounded-full bg-highlight text-highlight-foreground">
                  <Check className="size-2.5" strokeWidth={3} aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        {/* Bleeds past the right edge on wide screens; scrolls sideways inside its own box on phones. */}
        <div className="-mr-4 overflow-x-auto pb-4 sm:-mr-6 lg:overflow-visible lg:pb-0">
          <DashboardMock />
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- stages */

function Shape({ kind }: { kind: StageShape }) {
  const base = "drop-shadow-[0_18px_18px_rgb(27_29_58/0.25)]";
  if (kind === "sphere")
    return (
      <div
        className={cn(base, "size-24 rounded-full")}
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #fff 0 8%, color-mix(in srgb, var(--primary) 35%, #fff) 30%, var(--primary) 78%)",
        }}
      />
    );
  if (kind === "ring")
    return (
      <div
        className={cn(base, "size-24 rounded-full border-[16px]")}
        style={{
          borderColor: "color-mix(in srgb, var(--primary) 70%, #fff)",
          transform: "perspective(240px) rotateX(55deg) rotateZ(-20deg)",
          boxShadow: "inset 0 6px 10px rgb(255 255 255 / 0.6)",
        }}
      />
    );
  if (kind === "blocks")
    return (
      <div className={cn(base, "grid grid-cols-3 gap-1.5")}>
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className="size-7 rounded-md"
            style={{
              background: `color-mix(in srgb, var(--primary) ${30 + ((i * 37) % 60)}%, #fff)`,
              boxShadow: "inset 0 1px 2px rgb(255 255 255 / 0.7)",
            }}
          />
        ))}
      </div>
    );
  return (
    <div
      className={cn(base, "h-24 w-28")}
      style={{
        clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
        background:
          "linear-gradient(120deg, color-mix(in srgb, var(--primary) 30%, #fff), var(--primary) 55%, var(--highlight))",
      }}
    />
  );
}

const statusClass: Record<StageStatus, string> = {
  free: "bg-highlight text-highlight-foreground",
  paid: "border text-muted-foreground",
  soon: "bg-muted text-primary-text",
};

export function Stages() {
  const t = useTranslations("Stages");
  const items = t.raw("items") as { title: string; summary: string; meta: string }[];
  return (
    <section id="kurikulum" className="scroll-mt-20 py-16">
      <Container>
        <SectionTitle tag={t("tag")} label={t("label")} title={t("title")}>
          {t("body")}
        </SectionTitle>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-start lg:[--stagger:14px]">
          {items.map((s, i) => {
            const v = stageVisuals[i]!;
            return (
              <article
                key={s.title}
                className="grid gap-4 rounded-[20px] border bg-card p-5"
                style={{ marginTop: `calc(var(--stagger, 0px) * ${i})` }}
              >
                <div className="grid gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.7rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                      {t("stage", { number: i + 1 })}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold whitespace-nowrap",
                        statusClass[v.status],
                      )}
                    >
                      {t(`status.${v.status}`)}
                    </span>
                  </div>
                  <h3 className="text-[1.15rem] font-semibold tracking-tight">{s.title}</h3>
                  <p className="text-[0.85rem] leading-relaxed text-muted-foreground">{s.summary}</p>
                </div>
                <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-muted bg-[radial-gradient(circle_at_50%_35%,var(--card),var(--muted))]">
                  <Shape kind={v.shape} />
                </div>
                <p className="text-[0.82rem] text-muted-foreground tabular-nums">{s.meta}</p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- showcase (in place of a testimonial) */

export function Showcase() {
  const t = useTranslations("Showcase");
  return (
    <section className="py-16">
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.6fr)]">
        <div className="overflow-hidden rounded-[20px] bg-[#15172f] p-5 font-mono text-[0.78rem] leading-relaxed text-[#d9dbf5] shadow-[0_30px_60px_-30px_rgb(27_29_58/0.6)]">
          <p className="mb-3 flex items-center gap-2 font-sans text-[0.72rem] font-semibold tracking-[0.08em] text-[#a0a3c6] uppercase">
            <span className="size-2 rounded-full bg-[#ff7a6b]" /> {t("terminalLabel")}
          </p>
          <pre className="whitespace-pre-wrap">{(t.raw("terminal") as string[]).join("\n")}</pre>
        </div>
        <div className="grid gap-5">
          <Chip tag={t("tag")}>{t("label")}</Chip>
          <p className="text-[clamp(1.3rem,2.2vw,1.65rem)] leading-snug font-semibold tracking-[-0.02em]">
            {t("statement")}
          </p>
          <p className="text-[0.9rem] text-muted-foreground">{t("projects")}</p>
        </div>
        <dl className="grid grid-cols-3 gap-6 lg:grid-cols-1">
          {(t.raw("stats") as { value: string; label: string }[]).map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-tight tabular-nums">{s.value}</dd>
              <dd className="text-[0.85rem] text-muted-foreground">{s.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- pricing */

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <Check className="mt-1 size-4 shrink-0 text-highlight" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

export function Pricing() {
  const t = useTranslations("Pricing");
  const locale = useLocale();
  const price = `Rp${passPrice.toLocaleString(locale === "id" ? "id-ID" : "en-US")}`;
  return (
    <section id="harga" className="scroll-mt-20 py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle tag={t("tag")} label={t("label")} title={t("title")}>
            {t("body")}
          </SectionTitle>
          <p className="rounded-full border bg-card px-4 py-2 text-[0.8rem] text-muted-foreground">{t("methods")}</p>
        </div>
        <div className="mt-12 grid max-w-[860px] items-start gap-5 md:grid-cols-2">
          <div className="grid gap-6 rounded-[22px] border bg-card p-7 md:mt-8">
            <div>
              <h3 className="font-semibold">{t("free.name")}</h3>
              <p className="mt-3 flex items-baseline gap-1.5">
                <b className="text-[2.6rem] leading-none font-semibold tracking-tight">{t("free.price")}</b>
                <span className="text-sm text-muted-foreground">{t("free.period")}</span>
              </p>
              <p className="mt-3 text-[0.9rem] text-muted-foreground">{t("free.body")}</p>
            </div>
            <ul className="grid gap-2.5 border-t pt-5 text-[0.92rem]">
              {(t.raw("free.features") as string[]).map((f) => (
                <CheckItem key={f}>{f}</CheckItem>
              ))}
            </ul>
            <OutlinePill href="#top">{t("free.cta")}</OutlinePill>
          </div>

          <div className="overflow-hidden rounded-[22px] border-2 border-highlight">
            <p className="bg-highlight py-1.5 text-center text-[0.75rem] font-semibold text-highlight-foreground">
              {t("pass.badge")}
            </p>
            <div className="grid gap-6 bg-card p-7">
              <div>
                <h3 className="font-semibold text-highlight">{t("pass.name")}</h3>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <b className="text-[2.6rem] leading-none font-semibold tracking-tight tabular-nums">{price}</b>
                  <span className="text-sm text-muted-foreground">{t("pass.period")}</span>
                </p>
                <p className="mt-3 text-[0.9rem] text-muted-foreground">{t("pass.body")}</p>
              </div>
              <ul className="grid gap-2.5 border-t pt-5 text-[0.92rem]">
                {(t.raw("pass.features") as string[]).map((f) => (
                  <CheckItem key={f}>{f}</CheckItem>
                ))}
              </ul>
              <PillLink href="#top">{t("pass.cta")}</PillLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- faq */

export function Faq() {
  const t = useTranslations("Faq");
  return (
    <section id="faq" className="scroll-mt-20 py-16">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <SectionTitle tag={t("tag")} label={t("label")} title={t("title")} />
        <div className="border-t">
          {(t.raw("items") as { q: string; a: string }[]).map((f, i) => (
            <details key={f.q} open={i === 0} className="group border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[1rem] font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  aria-hidden
                  className="grid size-7 shrink-0 place-items-center rounded-full border text-[1rem] leading-none transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[64ch] pb-5 leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- final cta */

export function FinalCta() {
  const t = useTranslations("Cta");
  return (
    <section className="py-16">
      <Container>
        {/* Fixed colors: this panel looks the same in light and dark mode. */}
        <div className="grid overflow-hidden rounded-[28px] lg:grid-cols-2">
          <div className="grid content-center gap-6 bg-[#15172f] p-8 text-white sm:p-12">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 py-0.5 pr-3 pl-0.5 text-[0.68rem] font-semibold tracking-[0.06em] uppercase">
              <span className="rounded-full bg-[#ff7a6b] px-2 py-0.5 text-[#15172f]">{t("tag")}</span>
              <span className="text-white/70">{t("label")}</span>
            </span>
            <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
              {t("title")}
            </h2>
            <p className="text-white/70">{t("body")}</p>
            <div className="flex flex-wrap gap-3">
              <PillLink href="#top" tone="light">
                {t("primary")}
              </PillLink>
              <a
                href="#kurikulum"
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-5 text-[0.95rem] font-semibold hover:border-white/60"
              >
                {t("secondary")}
              </a>
            </div>
          </div>

          <div
            className="relative grid min-h-[340px] content-center justify-items-center gap-4 p-8"
            style={{ background: "linear-gradient(160deg, #2f3380 0%, #6b4a9e 55%, #e0705f 100%)" }}
          >
            <div className="max-w-[320px] rounded-2xl bg-[#15172f] p-4 text-[0.9rem] text-white shadow-xl">
              <p className="flex items-center gap-2 font-mono text-[0.75rem] text-[#a0a3c6]">
                <Play className="size-3" aria-hidden /> {t("ran")}
              </p>
              <p className="mt-1.5 font-mono">Total Rp 59,500</p>
            </div>
            <div className="max-w-[320px] translate-x-6 rounded-2xl bg-white p-4 text-[0.9rem] text-[#1b1d3a] shadow-xl">
              <p className="flex items-center gap-2 font-semibold">
                <Check className="size-4 text-[#1f8a5b]" aria-hidden /> {t("quizDone")}
              </p>
              <p className="mt-1 text-[#5e6283]">{t("quizBody")}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#15172f] px-4 py-2 text-[0.82rem] text-white shadow-xl">
              <Flame className="size-4 text-[#ff7a6b]" aria-hidden /> {t("streak")}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- footer */

export function SiteFooter() {
  const t = useTranslations("Footer");
  const common = useTranslations("Common");
  const cols = [
    {
      title: t("learn"),
      links: [
        [t("links.curriculum"), "#kurikulum"],
        [t("links.pricing"), "#harga"],
        [t("links.faq"), "#faq"],
      ],
    },
    {
      title: t("account"),
      links: [
        [t("links.signIn"), "#top"],
        [t("links.signUp"), "#top"],
      ],
    },
  ];
  return (
    <footer className="pt-10 pb-12">
      <Container className="grid gap-10 border-t pt-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="grid content-start gap-2">
          <p className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-[10px] bg-primary font-mono text-[0.75rem] text-primary-foreground">
              py
            </span>
            {brand.name}
          </p>
          <p className="text-sm text-muted-foreground">{common("tagline")}</p>
          <p className="text-sm text-muted-foreground">{common("supportedBy", { name: brand.supportedBy })}</p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title} className="grid content-start gap-2.5 text-sm">
            <p className="font-semibold">{c.title}</p>
            {c.links.map(([label, href]) => (
              <a key={label} href={href} className="w-fit text-muted-foreground hover:text-foreground">
                {label}
              </a>
            ))}
          </nav>
        ))}
      </Container>
    </footer>
  );
}
