"use client";

import { CheckCircle2, Clock, CreditCard, Loader2, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api";
import { cn, fill } from "@/lib/utils";
import type messages from "../../../messages/id.json";

type Labels = (typeof messages)["PaymentResult"];
type Status = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";

// Poll while PENDING: every 4 s for the first minute, then every 15 s, up to ~10 minutes in total.
const delay = (n: number) => (n < 15 ? 4_000 : 15_000);
const MAX_TRIES = 50;

/**
 * Asks the API to confirm the order with Midtrans (POST /sync) instead of trusting the query string Snap appends
 * on return. Access turns on here even if the webhook is late.
 */
export function PaymentResult({ orderId, locale, labels }: { orderId: string; locale: string; labels: Labels }) {
  const [status, setStatus] = useState<Status | "notFound" | null>(null);
  const [accessUntil, setAccessUntil] = useState<string | null>(null);
  const [gaveUp, setGaveUp] = useState(false);
  const [round, setRound] = useState(0); // "Check again" starts a new round of polling
  // The Snap page to finish paying, while the order is PENDING and its payment window is open.
  const [pay, setPay] = useState<{ url: string; until: string } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    async function tick(tries: number) {
      const { data, error } = await api.api.payments
        .orders({ orderId })
        .sync.post()
        .catch(() => ({ data: null, error: { status: 0 } }));
      if (cancelled) return;
      if (error) {
        if (error.status === 404 || error.status === 422) return setStatus("notFound");
        // Network or server trouble: keep what we show and try again.
      } else if (data) {
        setStatus(data.status);
        setPay(data.paymentUrl ? { url: data.paymentUrl, until: String(data.payUntil) } : null);
        if (data.status === "PAID") {
          const me = await api.api.me.get().catch(() => null);
          if (!cancelled && me?.data?.accessUntil) setAccessUntil(String(me.data.accessUntil));
          return;
        }
        if (data.status !== "PENDING") return;
      }
      if (tries >= MAX_TRIES) return setGaveUp(true);
      timer = setTimeout(() => void tick(tries + 1), delay(tries));
    }
    void tick(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId, round]);

  if (status === null) {
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden /> {labels.checking}
      </p>
    );
  }

  const copy = status === "notFound" ? labels.notFound : labels[status];
  const date =
    accessUntil &&
    new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
      dateStyle: "long",
      timeZone: "Asia/Jakarta",
    }).format(new Date(accessUntil));
  const Icon = status === "PAID" ? CheckCircle2 : status === "PENDING" ? Clock : XCircle;
  const pill =
    "inline-flex h-11 items-center gap-2 rounded-full px-5 text-[0.92rem] font-semibold outline-none focus-visible:ring-4 focus-visible:ring-ring/50";

  return (
    <div aria-live="polite" className="grid gap-5 rounded-[24px] border bg-card p-6 sm:p-8">
      <Icon
        className={cn(
          "size-10",
          status === "PAID" ? "text-success" : status === "PENDING" ? "text-primary-text" : "text-destructive",
        )}
        aria-hidden
      />
      <div className="grid gap-2">
        <h1 className="text-[1.8rem] leading-tight font-semibold tracking-[-0.02em]">{copy.title}</h1>
        <p className="leading-relaxed text-muted-foreground">
          {status === "PAID"
            ? `${date ? `${fill(labels.PAID.body, { date })} ` : ""}${labels.PAID.receipt}`
            : copy.body}
        </p>
        {status !== "notFound" && (
          <p className="font-mono text-[0.8rem] text-muted-foreground">{fill(labels.order, { id: orderId })}</p>
        )}
      </div>
      {status === "PENDING" && pay && (
        <p className="text-[0.92rem] font-semibold">
          {fill(labels.payBefore, {
            date: new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Jakarta",
            }).format(new Date(pay.until)),
          })}
        </p>
      )}
      {status === "PENDING" && gaveUp && <p className="text-[0.9rem]">{labels.stillPending}</p>}
      <div className="flex flex-wrap gap-3">
        {status === "PAID" && (
          <Link href="/dashboard" className={cn(pill, "bg-primary text-primary-foreground")}>
            {labels.startLearning}
          </Link>
        )}
        {status === "PENDING" && pay && (
          <a href={pay.url} className={cn(pill, "bg-primary text-primary-foreground")}>
            <CreditCard className="size-4" aria-hidden /> {labels.continue}
          </a>
        )}
        {status === "PENDING" && gaveUp && (
          <button
            type="button"
            onClick={() => {
              setGaveUp(false);
              setRound((r) => r + 1);
            }}
            className={cn(pill, pay ? "border hover:border-foreground/40" : "bg-primary text-primary-foreground")}
          >
            <RotateCcw className="size-4" aria-hidden /> {labels.checkAgain}
          </button>
        )}
        {(status === "FAILED" || status === "EXPIRED") && (
          <Link href="/billing" className={cn(pill, "bg-primary text-primary-foreground")}>
            {labels.tryAgain}
          </Link>
        )}
        <Link href="/billing" className={cn(pill, "border hover:border-foreground/40")}>
          {labels.toBilling}
        </Link>
      </div>
    </div>
  );
}
