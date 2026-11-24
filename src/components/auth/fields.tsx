"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const inputClass = "h-11 rounded-xl px-3.5 text-[0.95rem] md:text-[0.95rem]";

type FieldProps = Omit<React.ComponentProps<"input">, "id"> & { label: string; hint?: string };

export function TextField({ label, hint, className, ...props }: FieldProps) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-[0.88rem] font-semibold">
        {label}
      </Label>
      <Input
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={cn(inputClass, className)}
        {...props}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-[0.8rem] text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function PasswordField({
  label,
  hint,
  showLabel,
  hideLabel,
  ...props
}: FieldProps & { showLabel: string; hideLabel: string }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-[0.88rem] font-semibold">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={cn(inputClass, "pr-11")}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="absolute inset-y-0 right-1 my-auto grid size-9 place-items-center rounded-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-[0.8rem] text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground text-[0.95rem] font-semibold text-background transition-opacity outline-none focus-visible:ring-4 focus-visible:ring-ring/50 disabled:opacity-60"
    >
      {pending ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}

/** Form-level message. role="alert" so screen readers announce errors as they appear. */
export function FormMessage({ tone, children }: { tone: "error" | "info"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-3.5 py-3 text-[0.88rem] leading-relaxed",
        tone === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : "bg-muted text-foreground",
      )}
    >
      {children}
    </p>
  );
}
