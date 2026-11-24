import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { VerifyPanel } from "@/components/auth/forms";

export async function generateMetadata({ params }: PageProps<"/[locale]/verify-email">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "Auth" });
  return { title: t("verify.title"), robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/[locale]/verify-email">) {
  setRequestLocale((await params).locale as "id" | "en");
  return (
    <Suspense>
      <VerifyPanel />
    </Suspense>
  );
}
