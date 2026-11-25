"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api";

type Labels = { markComplete: string; completed: string; saving: string; completeFailed: string };

/** Marks the lesson complete (idempotent on the API), then refreshes so the sidebar ticks and progress update. */
export function CompleteButton({
  slug,
  initiallyDone,
  labels,
}: {
  slug: string;
  initiallyDone: boolean;
  labels: Labels;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "done" | "failed">(initiallyDone ? "done" : "idle");

  async function complete() {
    setState("saving");
    const { error } = await api.api
      .progress({ slug })
      .complete.post()
      .catch(() => ({ error: true }));
    if (error) return setState("failed");
    setState("done");
    router.refresh();
  }

  if (state === "done") {
    return (
      <p className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-success/10 px-5 text-[0.92rem] font-semibold text-success">
        <Check className="size-4" strokeWidth={3} aria-hidden /> {labels.completed}
      </p>
    );
  }
  return (
    <div className="grid justify-items-start gap-2">
      <button
        type="button"
        onClick={complete}
        disabled={state === "saving"}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[0.92rem] font-semibold text-primary-foreground outline-none focus-visible:ring-4 focus-visible:ring-ring/50 disabled:opacity-70"
      >
        {state === "saving" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Check className="size-4" strokeWidth={3} aria-hidden />
        )}
        {state === "saving" ? labels.saving : labels.markComplete}
      </button>
      <p aria-live="polite" className="m-0 text-[0.85rem] text-destructive">
        {state === "failed" && labels.completeFailed}
      </p>
    </div>
  );
}
