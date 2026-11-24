import { useTranslations } from "next-intl";
import { HeaderAuth } from "@/components/header-auth";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { brand } from "@/config/brand";
import { Link } from "@/i18n/navigation";
import { AppNav } from "./app-nav";

export function AppHeader() {
  const t = useTranslations("App");
  const header = useTranslations("Header");
  const common = useTranslations("Common");
  const account = useTranslations("Account");
  const items = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/#kurikulum", label: t("nav.curriculum") },
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
          <AppNav label={t("navLabel")} items={items} className="hidden md:flex" />
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher
            label={common("language")}
            names={{ id: common("languageNames.id"), en: common("languageNames.en") }}
          />
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
        <AppNav label={t("navLabel")} items={items} />
      </div>
    </header>
  );
}
