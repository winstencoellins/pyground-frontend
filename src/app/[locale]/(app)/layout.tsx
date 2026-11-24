import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { AppHeader } from "@/components/app/app-header";
import { AuthGate } from "@/components/app/auth-gate";

/** Base layout for the signed-in area: app header (theme + language), then the session-checked page. */
export default async function AppLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = (await params).locale as "id" | "en";
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "App" });
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-10 sm:px-6">
        {/* The session check reads cookies, so it streams in after the static shell. */}
        <Suspense fallback={<p className="text-muted-foreground">{t("loading")}</p>}>
          <AuthGate locale={locale}>{children}</AuthGate>
        </Suspense>
      </main>
    </>
  );
}
