import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { SignUpForm } from "@/components/auth/forms";

export async function generateMetadata({ params }: PageProps<"/[locale]/sign-up">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "Auth" });
  return { title: t("signUp.title"), robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/[locale]/sign-up">) {
  setRequestLocale((await params).locale as "id" | "en");
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
