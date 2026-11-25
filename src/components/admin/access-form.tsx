"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api";

type Labels = {
  grant: string;
  revoke: string;
  daysLabel: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  saving: string;
  saved: string;
  failed: string;
  revokeConfirm: string;
};

/** Grant N days (added to max(now, accessUntil)) or revoke now; the API logs both with the reason. */
export function AccessForm({ userId, canRevoke, labels }: { userId: string; canRevoke: boolean; labels: Labels }) {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  async function submit(action: "grant" | "revoke") {
    if (action === "revoke" && !window.confirm(labels.revokeConfirm)) return;
    setState("saving");
    const body = action === "grant" ? { action, days, reason } : { action, reason };
    const { error } = await api.api.admin
      .users({ id: userId })
      .access.post(body)
      .catch(() => ({ error: true }));
    if (error) return setState("failed");
    setState("saved");
    setReason("");
    router.refresh();
  }

  const valid = reason.trim().length >= 3;
  const field =
    "h-9 rounded-lg border bg-background px-2.5 text-[16px] outline-none focus-visible:ring-4 focus-visible:ring-ring/50 sm:text-[0.85rem]";
  return (
    <form
      className="grid gap-3 pt-3"
      onSubmit={(e) => {
        e.preventDefault();
        void submit("grant");
      }}
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-[0.78rem] text-muted-foreground">
          {labels.daysLabel}
          <input
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className={`${field} w-24`}
          />
        </label>
        <label className="grid min-w-0 flex-1 gap-1 text-[0.78rem] text-muted-foreground">
          {labels.reasonLabel}
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={labels.reasonPlaceholder}
            maxLength={500}
            required
            minLength={3}
            className={`${field} min-w-[12rem]`}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={!valid || state === "saving" || days < 1 || days > 365}
          className="h-9 rounded-full bg-primary px-4 text-[0.85rem] font-semibold text-primary-foreground disabled:opacity-50"
        >
          {state === "saving" ? labels.saving : labels.grant}
        </button>
        {canRevoke && (
          <button
            type="button"
            onClick={() => void submit("revoke")}
            disabled={!valid || state === "saving"}
            className="h-9 rounded-full border border-destructive/40 px-4 text-[0.85rem] font-semibold text-destructive disabled:opacity-50"
          >
            {labels.revoke}
          </button>
        )}
        <span
          aria-live="polite"
          className={state === "failed" ? "text-[0.82rem] text-destructive" : "text-[0.82rem] text-success"}
        >
          {state === "saved" ? labels.saved : state === "failed" ? labels.failed : ""}
        </span>
      </div>
    </form>
  );
}
