"use client";

import { useState } from "react";

type Day = { date: string; amount: number; orders: number };

/**
 * Daily revenue: one series, so one hue (primary, >= 3:1 on the card in both themes), no legend box (the title
 * names it). Thin bars with a 2px gap and 4px rounded tops on a baseline; recessive grid; a tooltip per day on
 * hover (the whole column is the hit target). Keyboard and screen-reader users get the table below the chart.
 */
export function RevenueChart({
  days,
  locale,
  labels,
}: {
  days: Day[];
  locale: string;
  labels: {
    title: string;
    empty: string;
    orders: string;
    showTable: string;
    date: string;
    revenue: string;
    ordersCol: string;
  };
}) {
  const [active, setActive] = useState<number | null>(null);
  const tag = locale === "id" ? "id-ID" : "en-US";
  const rupiah = (n: number) => `Rp${n.toLocaleString(tag)}`;
  const day = (d: string, long = false) =>
    new Date(`${d}T00:00:00+07:00`).toLocaleDateString(tag, {
      day: "numeric",
      month: long ? "long" : "short",
      ...(long && { year: "numeric" }),
      timeZone: "Asia/Jakarta",
    });
  const max = Math.max(...days.map((d) => d.amount), 0);
  // A round axis top: 1, 2 or 5 × 10^n just above the max.
  const top =
    max === 0
      ? 1
      : (() => {
          const p = 10 ** Math.floor(Math.log10(max));
          return [1, 2, 5, 10].map((m) => m * p).find((v) => v >= max)!;
        })();
  const ticks = [top, top / 2, 0];
  const [k, m] = locale === "id" ? ["rb", "jt"] : ["k", "M"];
  const short = (v: number) => (v >= 1_000_000 ? `${v / 1_000_000}${m}` : v >= 1000 ? `${v / 1000}${k}` : String(v));
  const total = days.reduce((n, d) => n + d.amount, 0);
  const a = active !== null ? days[active] : null;

  return (
    <figure className="grid gap-3 rounded-[22px] border bg-card p-5 sm:p-6">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-semibold">{labels.title}</span>
        <span className="text-[0.85rem] text-muted-foreground tabular-nums">
          {days.length ? `${day(days[0].date)} – ${day(days[days.length - 1].date)}` : ""}
        </span>
      </figcaption>
      {max === 0 ? (
        <p className="py-10 text-center text-[0.9rem] text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2">
          {/* y axis labels */}
          <div className="relative h-48 text-right text-[0.7rem] text-muted-foreground tabular-nums" aria-hidden>
            {ticks.map((v) => (
              <span key={v} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - v / top) * 100}%` }}>
                {short(v)}
              </span>
            ))}
          </div>
          <div
            role="img"
            aria-label={`${labels.title}: ${rupiah(total)}`}
            className="relative h-48 border-b border-border"
            onMouseLeave={() => setActive(null)}
          >
            {ticks.slice(0, -1).map((v) => (
              <span
                key={v}
                aria-hidden
                className="absolute inset-x-0 border-t border-dashed border-border/70"
                style={{ top: `${(1 - v / top) * 100}%` }}
              />
            ))}
            <div className="absolute inset-0 flex items-end gap-[2px]">
              {days.map((d, i) => (
                <div key={d.date} onMouseEnter={() => setActive(i)} className="flex h-full min-w-0 flex-1 items-end">
                  <div
                    className="w-full rounded-t-[4px] bg-primary transition-opacity"
                    style={{
                      height: d.amount ? `max(2px, ${(d.amount / top) * 100}%)` : 0,
                      opacity: active === null || active === i ? 1 : 0.45,
                    }}
                  />
                </div>
              ))}
            </div>
            {a && (
              <div
                className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border bg-popover px-2.5 py-1.5 text-[0.78rem] whitespace-nowrap shadow-md"
                style={{ left: `clamp(60px, ${((active! + 0.5) / days.length) * 100}%, calc(100% - 60px))` }}
              >
                <p className="text-muted-foreground">{day(a.date, true)}</p>
                <p className="font-semibold tabular-nums">{rupiah(a.amount)}</p>
                <p className="text-muted-foreground">{labels.orders.replace("{count}", String(a.orders))}</p>
              </div>
            )}
          </div>
        </div>
      )}
      <details className="text-[0.85rem]">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">{labels.showTable}</summary>
        <div className="mt-2 max-h-64 overflow-auto rounded-xl border">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 bg-muted">
              <tr>
                <th className="px-3 py-1.5 font-semibold">{labels.date}</th>
                <th className="px-3 py-1.5 text-right font-semibold">{labels.revenue}</th>
                <th className="px-3 py-1.5 text-right font-semibold">{labels.ordersCol}</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.date} className="border-t">
                  <td className="px-3 py-1.5">{day(d.date, true)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{rupiah(d.amount)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{d.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
