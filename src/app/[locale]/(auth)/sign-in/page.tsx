import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/forms";

export async function generateMetadata({ params }: PageProps<"/[locale]/sign-in">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "id" | "en", namespace: "Auth" });
  return { title: t("signIn.title"), robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/[locale]/sign-in">) {
  setRequestLocale((await params).locale as "id" | "en");
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
