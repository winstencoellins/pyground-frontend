"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

/** Creates an order, then sends the learner to Midtrans' hosted Snap page (it returns to /payment/result). */
export function CheckoutButton({ label, labels }: { label: string; labels: { redirecting: string; failed: string } }) {
  const [state, setState] = useState<"idle" | "going" | "failed">("idle");

  async function checkout() {
    setState("going");
    const { data, error } = await api.api.payments.checkout.post().catch(() => ({ data: null, error: true }));
    if (error || !data) return setState("failed");
    window.location.assign(data.redirectUrl);
  }

  return (
    <div className="grid justify-items-start gap-2">
      <button
        type="button"
        onClick={checkout}
        disabled={state === "going"}
        className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[0.95rem] font-semibold text-primary-foreground outline-none focus-visible:ring-4 focus-visible:ring-ring/50 disabled:opacity-70"
      >
        {state === "going" ? labels.redirecting : label}
        {state === "going" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <ArrowRight className="size-4" aria-hidden />
        )}
      </button>
      <p aria-live="polite" className="m-0 text-[0.88rem] text-destructive">
        {state === "failed" && labels.failed}
      </p>
    </div>
  );
}
