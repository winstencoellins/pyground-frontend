import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ResetForm } from "@/components/auth/forms";

export async function generateMetadata({ params }: PageProps<"/[locale]/reset-password">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "Auth" });
  return { title: t("reset.title"), robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/[locale]/reset-password">) {
  setRequestLocale((await params).locale as "id" | "en");
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
