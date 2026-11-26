"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { authErrorKey, type AuthErrorKey } from "@/components/auth/errors";
import { FormMessage, PasswordField, TextField } from "@/components/auth/fields";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

const MIN_PASSWORD = 8; // matches minPasswordLength in pyground-backend/src/lib/auth.ts
const MAX_NAME = 80; // matches MAX_NAME in pyground-backend/src/lib/auth.ts

type Result = { ok: true } | { ok: false; error: AuthErrorKey } | null;

/** Runs a Better Auth call, turning thrown network errors into an error key like the returned ones. */
async function attempt(call: () => Promise<{ error: Parameters<typeof authErrorKey>[0] }>): Promise<Result> {
  try {
    const { error } = await call();
    return error ? { ok: false, error: authErrorKey(error) } : { ok: true };
  } catch {
    return { ok: false, error: "NETWORK" };
  }
}

function SaveButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full bg-foreground px-5 text-[0.92rem] font-semibold text-background outline-none focus-visible:ring-4 focus-visible:ring-ring/50 disabled:opacity-60"
    >
      {pending && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}

export function NameForm({ name, email }: { name: string; email: string }) {
  const t = useTranslations("Profile.account");
  const errors = useTranslations("Auth.errors");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    const next = String(new FormData(e.currentTarget).get("name")).trim();
    const r = await attempt(() => authClient.updateUser({ name: next }));
    setPending(false);
    setResult(r);
    if (r?.ok) router.refresh(); // the header and dashboard read the name on the server
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <TextField
        label={t("name")}
        hint={t("nameHint")}
        name="name"
        defaultValue={name}
        autoComplete="name"
        required
        maxLength={MAX_NAME}
      />
      <TextField label={t("email")} hint={t("emailHint")} value={email} readOnly type="email" />
      {result && (
        <FormMessage tone={result.ok ? "info" : "error"}>{result.ok ? t("saved") : errors(result.error)}</FormMessage>
      )}
      <SaveButton pending={pending}>{t("save")}</SaveButton>
    </form>
  );
}

export function PasswordForm() {
  const t = useTranslations("Profile.password");
  const auth = useTranslations("Auth");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const fields = { showLabel: auth("fields.showPassword"), hideLabel: auth("fields.hidePassword") };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setResult(null);
    const r = await attempt(() =>
      authClient.changePassword({
        currentPassword: String(data.get("current")),
        newPassword: String(data.get("new")),
        revokeOtherSessions: data.get("signOutOthers") === "on",
      }),
    );
    setPending(false);
    setResult(r);
    if (r?.ok) form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <PasswordField
        label={t("current")}
        name="current"
        autoComplete="current-password"
        required
        maxLength={128}
        {...fields}
      />
      <PasswordField
        label={t("new")}
        hint={auth("fields.passwordHint")}
        name="new"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD}
        maxLength={128}
        {...fields}
      />
      <label className="flex items-center gap-2.5 text-[0.9rem]">
        <input type="checkbox" name="signOutOthers" defaultChecked className="size-4 accent-primary" />
        {t("signOutOthers")}
      </label>
      {result && (
        <FormMessage tone={result.ok ? "info" : "error"}>
          {result.ok ? t("saved") : auth(`errors.${result.error}`)}
        </FormMessage>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <SaveButton pending={pending}>{t("save")}</SaveButton>
        <Link href="/forgot-password" className="text-[0.88rem] font-semibold text-primary-text">
          {t("forgot")}
        </Link>
      </div>
    </form>
  );
}
