import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { brand } from "@/config/brand";
import { Link } from "@/i18n/navigation";
import { Container } from "./ui";

const anchors = [
  ["why", "#cara"],
  ["curriculum", "#kurikulum"],
  ["pricing", "#harga"],
  ["faq", "#faq"],
] as const;

export function SiteHeader() {
  const t = useTranslations("Header");
  const common = useTranslations("Common");
  return (
    <header className="sticky top-0 z-20 bg-background/85 backdrop-blur">
      <Container className="grid h-[72px] grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex w-fit items-center gap-2.5 text-[1.15rem] font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-full bg-foreground font-mono text-[0.78rem] font-semibold text-background">
            py
          </span>
          {brand.name}
        </Link>
        <nav
          aria-label={t("navLabel")}
          className="hidden gap-7 text-[0.9rem] font-medium text-muted-foreground md:flex"
        >
          {anchors.map(([key, href]) => (
            <a key={key} href={href} className="hover:text-foreground">
              {t(`nav.${key}`)}
            </a>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-2">
          <LocaleSwitcher
            label={common("language")}
            names={{ id: common("languageNames.id"), en: common("languageNames.en") }}
          />
          <ThemeToggle label={common("themeToggle")} />
          {/* shortcut: auth routes arrive with #11; these point at the page until then. */}
          <a href="#harga" className="hidden px-1.5 text-[0.9rem] font-semibold lg:block">
            {t("signIn")}
          </a>
          <a
            href="#harga"
            className="hidden h-10 items-center rounded-full bg-foreground px-4 text-[0.88rem] font-semibold text-background outline-none focus-visible:ring-4 focus-visible:ring-ring/50 sm:inline-flex"
          >
            {t("start")}
          </a>
        </div>
      </Container>
    </header>
  );
}
