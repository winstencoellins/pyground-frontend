import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getFormatter, getMessages, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { NameForm, PasswordForm } from "@/components/profile/profile-forms";
import { Link } from "@/i18n/navigation";
import { getMe } from "@/lib/session";

type Locale = "id" | "en";

export async function generateMetadata({ params }: PageProps<"/[locale]/profile">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale as Locale, namespace: "Profile" });
  return { title: t("title"), robots: { index: false } };
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5 rounded-[24px] border bg-card p-6 sm:p-8">
      <h2 className="text-[1.15rem] font-semibold tracking-[-0.01em]">{title}</h2>
      {children}
    </section>
  );
}

export default async function ProfilePage({ params }: PageProps<"/[locale]/profile">) {
  const locale = (await params).locale as Locale;
  const [t, billing, common, format, me, messages] = await Promise.all([
    getTranslations({ locale, namespace: "Profile" }),
    getTranslations({ locale, namespace: "Billing" }),
    getTranslations({ locale, namespace: "Common" }),
    getFormatter({ locale }),
    getMe(),
    getMessages({ locale }),
  ]);
  if (!me) return null; // the (app) layout's AuthGate already sent signed-out visitors to sign in

  const date = (d: Date | string) => format.dateTime(new Date(d), { dateStyle: "long", timeZone: "Asia/Jakarta" });
  const accessUntil = me.accessUntil ? new Date(me.accessUntil) : null;
  const access =
    me.role === "ADMIN"
      ? billing("statusAdmin")
      : accessUntil && accessUntil > new Date()
        ? billing("statusActive", { date: date(accessUntil) })
        : accessUntil
          ? billing("statusExpired", { date: date(accessUntil) })
          : billing("statusFree");

  // Only the strings the client-side forms need ship to the browser.
  const clientMessages = {
    Profile: messages.Profile,
    Auth: { fields: messages.Auth.fields, errors: messages.Auth.errors },
  };

  return (
    <NextIntlClientProvider messages={clientMessages}>
      <div className="grid max-w-[720px] grid-cols-[minmax(0,1fr)] gap-6">
        <header className="mb-2 flex items-center gap-4">
          <span
            aria-hidden
            className="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-[1.3rem] font-semibold text-primary-foreground"
          >
            {me.name.trim().charAt(0).toUpperCase()}
          </span>
          <div className="grid min-w-0 gap-1">
            <h1 className="text-[clamp(1.8rem,4vw,2.4rem)] leading-tight font-semibold tracking-[-0.035em]">
              {t("title")}
            </h1>
            <p className="text-muted-foreground">{t("body")}</p>
          </div>
        </header>

        <Card title={t("account.title")}>
          <NameForm name={me.name} email={me.email} />
        </Card>

        <Card title={t("language.title")}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-[36em] text-[0.92rem] text-muted-foreground">{t("language.body")}</p>
            <Suspense fallback={<div className="h-9 w-[76px] rounded-full border" />}>
              <LocaleSwitcher
                label={common("language")}
                names={{ id: common("languageNames.id"), en: common("languageNames.en") }}
              />
            </Suspense>
          </div>
        </Card>

        <Card title={t("password.title")}>
          <PasswordForm />
        </Card>

        <Card title={t("access.title")}>
          <p className="text-[0.95rem]">{access}</p>
          <Link
            href="/billing"
            className="inline-flex w-fit items-center gap-1.5 text-[0.92rem] font-semibold text-primary-text"
          >
            {t("access.manage")} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Card>
      </div>
    </NextIntlClientProvider>
  );
}
