import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PillLink } from "@/components/landing/ui";
import { getMe } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/[locale]/dashboard">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale as "id" | "en", namespace: "App" });
  return { title: t("dashboard.title"), robots: { index: false } };
}

// shortcut: greeting only; progress per stage and "continue learning" arrive with #19.
export default async function DashboardPage({ params }: PageProps<"/[locale]/dashboard">) {
  const locale = (await params).locale as "id" | "en";
  const [t, me] = await Promise.all([getTranslations({ locale, namespace: "App" }), getMe()]);
  return (
    <div className="grid max-w-[640px] gap-4">
      <h1 className="text-[clamp(2rem,4vw,2.6rem)] leading-tight font-semibold tracking-[-0.035em]">
        {t("dashboard.greeting", { name: me?.name.split(" ")[0] ?? "" })}
      </h1>
      <p className="text-[1.05rem] leading-relaxed text-muted-foreground">{t("dashboard.body")}</p>
      <PillLink href="/#kurikulum">{t("dashboard.browse")}</PillLink>
    </div>
  );
}
