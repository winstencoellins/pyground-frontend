import { Flame, Play } from "lucide-react";
import { useTranslations } from "next-intl";

// Illustration of the learner dashboard (#19) with example data; it is not live.
const stagePct = [100, 42, 0];
const doneDays = 6;

export function DashboardMock() {
  const t = useTranslations("Dashboard");
  const tabs = t.raw("tabs") as string[];
  const week = t.raw("week") as string[];
  const stages = t.raw("stages") as string[];
  return (
    <div
      aria-label={t("label")}
      className="w-[760px] max-w-none rounded-[22px] border bg-card p-5 shadow-[0_40px_80px_-40px_rgb(10_31_28/0.45)]"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-[0.95rem] font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-primary font-mono text-[0.7rem] text-primary-foreground">
            py
          </span>
          Pyground
        </span>
        <div className="flex gap-1.5 text-[0.72rem] font-medium">
          <span className="rounded-full bg-foreground px-3 py-1 text-background">{tabs[0]}</span>
          <span className="rounded-full border px-3 py-1">{tabs[1]}</span>
          <span className="rounded-full border px-3 py-1">{tabs[2]}</span>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[1.35rem] font-semibold tracking-tight">{t("greeting")}</p>
        <p className="text-[0.85rem] text-muted-foreground">{t("yesterday")}</p>
      </div>

      <div className="mt-4 grid grid-cols-[1.35fr_1fr] gap-3">
        <div className="grid gap-3 rounded-2xl border bg-background p-4">
          <p className="text-[0.72rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            {t("continue")}
          </p>
          <div>
            <p className="text-[0.78rem] text-muted-foreground">{t("module")}</p>
            <p className="font-semibold">{t("lesson")}</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="motion-bar bg-brand-gradient h-full w-[42%] rounded-full" />
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[0.75rem] font-semibold text-background">
            <Play className="size-3" aria-hidden /> {t("resume")}
          </span>
        </div>

        <div className="grid content-start gap-3 rounded-2xl border bg-background p-4">
          <p className="flex items-center gap-1.5 text-[0.72rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            <Flame className="size-3.5 text-highlight-text" aria-hidden /> {t("streak")}
          </p>
          <p className="text-[1.8rem] leading-none font-semibold tracking-tight">
            6 <span className="text-[0.9rem] font-medium text-muted-foreground">{t("days")}</span>
          </p>
          <div className="flex gap-1.5">
            {week.map((d, i) => (
              <span
                key={i}
                className={
                  i < doneDays
                    ? "grid size-6 place-items-center rounded-full bg-highlight text-[0.62rem] font-semibold text-highlight-foreground"
                    : "grid size-6 place-items-center rounded-full border text-[0.62rem] text-muted-foreground"
                }
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className="col-span-2 grid gap-3 rounded-2xl border bg-background p-4">
          <p className="text-[0.72rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            {t("progress")}
          </p>
          {stages.map((label, i) => (
            <div key={label} className="grid grid-cols-[170px_1fr_40px] items-center gap-3 text-[0.8rem]">
              <span>{label}</span>
              <span className="h-2 overflow-hidden rounded-full bg-muted">
                <span
                  className="motion-bar bg-brand-gradient block h-full rounded-full"
                  style={{ width: `${stagePct[i]}%`, "--i": i + 1 } as React.CSSProperties}
                />
              </span>
              <span className="text-right text-muted-foreground tabular-nums">{stagePct[i]}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
