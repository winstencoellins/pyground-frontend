import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ForgotForm } from "@/components/auth/forms";

export async function generateMetadata({ params }: PageProps<"/[locale]/forgot-password">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "Auth" });
  return { title: t("forgot.title"), robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/[locale]/forgot-password">) {
  setRequestLocale((await params).locale as "id" | "en");
  return (
    <Suspense>
      <ForgotForm />
    </Suspense>
  );
}
