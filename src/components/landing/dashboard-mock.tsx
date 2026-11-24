import { Flame, Play } from "lucide-react";

// Illustration of the learner dashboard (#19) with example data; it is not live.
const stageBars = [
  { label: "Tahap 1 · Dasar-Dasar", pct: 100 },
  { label: "Tahap 2 · Inti Pemula", pct: 42 },
  { label: "Tahap 3 · Menengah", pct: 0 },
];
const week = ["S", "S", "R", "K", "J", "S", "M"];
const doneDays = 6;

export function DashboardMock() {
  return (
    <div
      aria-label="Contoh tampilan dashboard"
      className="w-[760px] max-w-none rounded-[22px] border bg-card p-5 shadow-[0_40px_80px_-40px_rgb(27_29_58/0.45)]"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-[0.95rem] font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-primary font-mono text-[0.7rem] text-primary-foreground">
            py
          </span>
          Pyground
        </span>
        <div className="flex gap-1.5 text-[0.72rem] font-medium">
          <span className="rounded-full bg-foreground px-3 py-1 text-background">Beranda</span>
          <span className="rounded-full border px-3 py-1">Kurikulum</span>
          <span className="rounded-full border px-3 py-1">Progres</span>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[1.35rem] font-semibold tracking-tight">Selamat pagi, Citra</p>
        <p className="text-[0.85rem] text-muted-foreground">Kemarin kamu menyelesaikan 2 pelajaran.</p>
      </div>

      <div className="mt-4 grid grid-cols-[1.35fr_1fr] gap-3">
        <div className="grid gap-3 rounded-2xl border bg-background p-4">
          <p className="text-[0.72rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            Lanjutkan belajar
          </p>
          <div>
            <p className="text-[0.78rem] text-muted-foreground">Dictionary dan Set</p>
            <p className="font-semibold">Loop dan Data Bersarang</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[42%] rounded-full bg-primary" />
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[0.75rem] font-semibold text-background">
            <Play className="size-3" aria-hidden /> Lanjutkan
          </span>
        </div>

        <div className="grid content-start gap-3 rounded-2xl border bg-background p-4">
          <p className="flex items-center gap-1.5 text-[0.72rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            <Flame className="size-3.5 text-highlight" aria-hidden /> Streak
          </p>
          <p className="text-[1.8rem] leading-none font-semibold tracking-tight">
            6 <span className="text-[0.9rem] font-medium text-muted-foreground">hari</span>
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
            Progres per tahap
          </p>
          {stageBars.map((s) => (
            <div key={s.label} className="grid grid-cols-[170px_1fr_40px] items-center gap-3 text-[0.8rem]">
              <span>{s.label}</span>
              <span className="h-2 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${s.pct}%` }} />
              </span>
              <span className="text-right text-muted-foreground tabular-nums">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
