import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppNav } from "@/components/app/app-nav";
import { getMe } from "@/lib/session";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/admin">): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale as "id" | "en", namespace: "Admin" });
  return { title: { default: t("title"), template: `%s · ${t("title")} · Pyground` }, robots: { index: false } };
}

/** ADMIN only. The proxy and AuthGate already require a session; students get a 404 (the API answers 403). */
export default async function AdminLayout({ children, params }: LayoutProps<"/[locale]/admin">) {
  const locale = (await params).locale as "id" | "en";
  const [t, me] = await Promise.all([getTranslations({ locale, namespace: "Admin" }), getMe()]);
  if (me?.role !== "ADMIN") notFound();
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[clamp(1.8rem,3.5vw,2.3rem)] font-semibold tracking-[-0.03em]">{t("title")}</h1>
        <AppNav
          label={t("title")}
          items={[
            { href: "/admin", label: t("nav.overview"), exact: true },
            { href: "/admin/users", label: t("nav.users") },
            { href: "/admin/orders", label: t("nav.orders") },
          ]}
          className="rounded-full border bg-card p-1"
        />
      </header>
      {children}
    </div>
  );
}
