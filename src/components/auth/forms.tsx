"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { AFTER_AUTH_PATH, authClient, safeNext } from "@/lib/auth-client";
import { AuthHeading } from "./auth-shell";
import { authErrorKey, type AuthErrorKey } from "./errors";
import { FormMessage, PasswordField, SubmitButton, TextField } from "./fields";

const MIN_PASSWORD = 8; // matches minPasswordLength in pyground-backend/src/lib/auth.ts

/** Runs an auth call, turning thrown network errors into the same { error } shape the client returns. */
async function attempt<T extends { error: Parameters<typeof authErrorKey>[0] }>(
  call: () => Promise<T>,
): Promise<AuthErrorKey | null> {
  try {
    const { error } = await call();
    return error ? authErrorKey(error) : null;
  } catch {
    return "NETWORK";
  }
}

function useAuthText() {
  const t = useTranslations("Auth");
  const fields = {
    showLabel: t("fields.showPassword"),
    hideLabel: t("fields.hidePassword"),
  };
  return { t, fields };
}

/** Verification links land here: /{locale}/verify-email?verified=1 (or with ?error= when the link is bad). */
const verifyCallback = (locale: string) => `/${locale}/verify-email?verified=1`;

/* ---------------------------------------------------------------- sign up */

export function SignUpForm() {
  const { t, fields } = useAuthText();
  const locale = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthErrorKey | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    setPending(true);
    setError(null);
    const err = await attempt(() =>
      authClient.signUp.email({
        name: String(form.get("name")).trim(),
        email,
        password: String(form.get("password")),
        locale, // verification email goes out in this language
        callbackURL: verifyCallback(locale),
      }),
    );
    if (err) {
      setError(err);
      setPending(false);
      return;
    }
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <>
      <AuthHeading title={t("signUp.title")} body={t("signUp.body")} />
      <form onSubmit={onSubmit} className="grid gap-4" noValidate={false}>
        {error && <FormMessage tone="error">{t(`errors.${error}`)}</FormMessage>}
        <TextField label={t("fields.name")} name="name" autoComplete="name" required maxLength={100} />
        <TextField label={t("fields.email")} name="email" type="email" autoComplete="email" required />
        <PasswordField
          label={t("fields.password")}
          hint={t("fields.passwordHint")}
          name="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          maxLength={128}
          {...fields}
        />
        <SubmitButton pending={pending}>{t("signUp.submit")}</SubmitButton>
        <p className="text-center text-[0.8rem] text-muted-foreground">{t("signUp.terms")}</p>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t("signUp.haveAccount")}{" "}
        <Link href="/sign-in" className="font-semibold text-primary-text hover:underline">
          {t("signUp.signInLink")}
        </Link>
      </p>
    </>
  );
}

/* ---------------------------------------------------------------- sign in */

export function SignInForm() {
  const { t, fields } = useAuthText();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [unverified, setUnverified] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    setPending(true);
    setError(null);
    setUnverified(null);
    let status: number | undefined;
    const err = await attempt(async () => {
      const res = await authClient.signIn.email({ email, password: String(form.get("password")) });
      status = res.error?.status;
      return res;
    });
    if (!err) {
      router.replace(next);
      router.refresh();
      return;
    }
    // 403 = not verified yet; the API has just emailed a fresh link (sendOnSignIn).
    if (status === 403) setUnverified(email);
    else setError(err);
    setPending(false);
  }

  return (
    <>
      <AuthHeading title={t("signIn.title")} body={t("signIn.body")} />
      <form onSubmit={onSubmit} className="grid gap-4">
        {error && <FormMessage tone="error">{t(`errors.${error}`)}</FormMessage>}
        {unverified && <FormMessage tone="info">{t("signIn.unverified", { email: unverified })}</FormMessage>}
        <TextField label={t("fields.email")} name="email" type="email" autoComplete="email" required />
        <PasswordField
          label={t("fields.password")}
          name="password"
          autoComplete="current-password"
          required
          {...fields}
        />
        <Link href="/forgot-password" className="-mt-1 w-fit text-sm font-semibold text-primary-text hover:underline">
          {t("signIn.forgot")}
        </Link>
        <SubmitButton pending={pending}>{t("signIn.submit")}</SubmitButton>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t("signIn.noAccount")}{" "}
        <Link href="/sign-up" className="font-semibold text-primary-text hover:underline">
          {t("signIn.signUpLink")}
        </Link>
      </p>
    </>
  );
}

/* ---------------------------------------------------------------- verify email */

const RESEND_COOLDOWN_S = 30;

export function VerifyPanel() {
  const { t } = useAuthText();
  const locale = useLocale();
  const params = useSearchParams();
  const linkError = params.get("error");
  const verified = params.get("verified") === "1" && !linkError;
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function resend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const err = await attempt(() =>
      authClient.sendVerificationEmail({ email: email.trim(), callbackURL: verifyCallback(locale) }),
    );
    setPending(false);
    if (err) return setError(err);
    setSent(true);
    setCooldown(RESEND_COOLDOWN_S);
  }

  if (verified) {
    return (
      <>
        <AuthHeading title={t("verify.doneTitle")} body={t("verify.doneBody")} />
        <Link
          href={AFTER_AUTH_PATH}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground text-[0.95rem] font-semibold text-background"
        >
          {t("verify.continue")}
        </Link>
      </>
    );
  }

  const knownEmail = params.get("email");
  return (
    <>
      {linkError ? (
        <AuthHeading title={t("verify.errorTitle")} body={t("verify.errorBody")} />
      ) : (
        <AuthHeading
          title={t("verify.title")}
          body={
            <>
              {knownEmail ? t("verify.body", { email: knownEmail }) : t("verify.bodyNoEmail")} {t("verify.spam")}
            </>
          }
        />
      )}
      <form onSubmit={resend} className="grid gap-4">
        {error && <FormMessage tone="error">{t(`errors.${error}`)}</FormMessage>}
        {sent && !error && <FormMessage tone="info">{t("verify.resent")}</FormMessage>}
        {(linkError || !knownEmail) && (
          <TextField
            label={t("fields.email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}
        <SubmitButton pending={pending}>
          {cooldown ? `${t("verify.resend")} (${cooldown})` : t("verify.resend")}
        </SubmitButton>
      </form>
    </>
  );
}

/* ---------------------------------------------------------------- forgot password */

export function ForgotForm() {
  const { t } = useAuthText();
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    setPending(true);
    setError(null);
    const err = await attempt(() =>
      authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/${locale}/reset-password` }),
    );
    setPending(false);
    // The API answers the same whether or not the email exists, so we always show "sent".
    if (err) setError(err);
    else setSentTo(email);
  }

  if (sentTo) {
    return (
      <>
        <AuthHeading title={t("forgot.sentTitle")} body={t("forgot.sent", { email: sentTo })} />
        <Link href="/sign-in" className="w-fit text-sm font-semibold text-primary-text hover:underline">
          {t("forgot.back")}
        </Link>
      </>
    );
  }

  return (
    <>
      <AuthHeading title={t("forgot.title")} body={t("forgot.body")} />
      <form onSubmit={onSubmit} className="grid gap-4">
        {error && <FormMessage tone="error">{t(`errors.${error}`)}</FormMessage>}
        <TextField label={t("fields.email")} name="email" type="email" autoComplete="email" required />
        <SubmitButton pending={pending}>{t("forgot.submit")}</SubmitButton>
      </form>
      <Link
        href="/sign-in"
        className="mt-8 w-fit justify-self-center text-sm font-semibold text-primary-text hover:underline"
      >
        {t("forgot.back")}
      </Link>
    </>
  );
}

/* ---------------------------------------------------------------- reset password */

export function ResetForm() {
  const { t, fields } = useAuthText();
  const params = useSearchParams();
  const token = params.get("token");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [done, setDone] = useState(false);

  if (!token || params.get("error") || error === "INVALID_TOKEN") {
    return (
      <>
        <AuthHeading title={t("reset.invalidTitle")} body={t("reset.invalidBody")} />
        <Link
          href="/forgot-password"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground text-[0.95rem] font-semibold text-background"
        >
          {t("reset.requestNew")}
        </Link>
      </>
    );
  }

  if (done) {
    return (
      <>
        <AuthHeading title={t("reset.doneTitle")} body={t("reset.doneBody")} />
        <Link
          href="/sign-in"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground text-[0.95rem] font-semibold text-background"
        >
          {t("reset.signIn")}
        </Link>
      </>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const err = await attempt(() =>
      authClient.resetPassword({ newPassword: String(new FormData(e.currentTarget).get("password")), token: token! }),
    );
    setPending(false);
    if (err) setError(err);
    else setDone(true);
  }

  return (
    <>
      <AuthHeading title={t("reset.title")} body={t("reset.body")} />
      <form onSubmit={onSubmit} className="grid gap-4">
        {error && <FormMessage tone="error">{t(`errors.${error}`)}</FormMessage>}
        <PasswordField
          label={t("fields.newPassword")}
          hint={t("fields.passwordHint")}
          name="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          maxLength={128}
          {...fields}
        />
        <SubmitButton pending={pending}>{t("reset.submit")}</SubmitButton>
      </form>
    </>
  );
}
