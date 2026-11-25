import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { HeaderAuth } from "@/components/header-auth";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { brand } from "@/config/brand";
import { Link } from "@/i18n/navigation";
import { AppNav, NavLinks } from "./app-nav";

export function AppHeader() {
  const t = useTranslations("App");
  const header = useTranslations("Header");
  const common = useTranslations("Common");
  const account = useTranslations("Account");
  const items = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/lessons", label: t("nav.curriculum") },
    { href: "/billing", label: t("nav.billing") },
  ];
  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-[1.05rem] font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-full bg-foreground font-mono text-[0.72rem] font-semibold text-background">
              py
            </span>
            <span className="hidden sm:inline">{brand.name}</span>
          </Link>
          <Suspense fallback={<NavLinks label={t("navLabel")} items={items} className="hidden md:flex" />}>
            <AppNav label={t("navLabel")} items={items} className="hidden md:flex" />
          </Suspense>
        </div>
        <div className="flex items-center gap-2">
          {/* Reads the current path; on per-request pages (lessons) that resolves after the static shell. */}
          <Suspense fallback={<div className="h-9 w-[76px] rounded-full border" />}>
            <LocaleSwitcher
              label={common("language")}
              names={{ id: common("languageNames.id"), en: common("languageNames.en") }}
            />
          </Suspense>
          <ThemeToggle label={common("themeToggle")} />
          <HeaderAuth
            labels={{
              signIn: header("signIn"),
              start: header("start"),
              signOut: account("signOut"),
              dashboard: account("dashboard"),
            }}
            inApp
          />
        </div>
      </div>
      {/* Phones: the nav gets its own row so the top bar never overflows. */}
      <div className="border-t px-4 py-1.5 md:hidden">
        <Suspense fallback={<NavLinks label={t("navLabel")} items={items} />}>
          <AppNav label={t("navLabel")} items={items} />
        </Suspense>
      </div>
    </header>
  );
}
