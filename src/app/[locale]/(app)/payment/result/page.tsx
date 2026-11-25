import type { Metadata } from "next";
import { getMessages, getTranslations } from "next-intl/server";
import { PaymentResult } from "@/components/billing/payment-result";

type Locale = "id" | "en";

export async function generateMetadata({ params }: PageProps<"/[locale]/payment/result">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale as Locale, namespace: "PaymentResult" });
  return { title: t("title"), robots: { index: false } };
}

/** Where Midtrans Snap sends the learner back: /payment/result?orderId=… (the proxy adds the locale). */
export default async function PaymentResultPage({ params, searchParams }: PageProps<"/[locale]/payment/result">) {
  const locale = (await params).locale as Locale;
  const [{ orderId }, messages] = await Promise.all([searchParams, getMessages({ locale })]);
  const id = typeof orderId === "string" && /^[A-Z0-9-]{1,50}$/.test(orderId) ? orderId : "";
  return (
    <div className="mx-auto w-full max-w-[640px]">
      {/* key: a new orderId (same page) starts a fresh check */}
      <PaymentResult key={id} orderId={id} locale={locale} labels={messages.PaymentResult} />
    </div>
  );
}
