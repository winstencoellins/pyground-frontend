import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { Container } from "./container";

const links = [
  { href: "#cara", label: "Cara belajar" },
  { href: "#kurikulum", label: "Kurikulum" },
  { href: "#harga", label: "Harga" },
  { href: "#faq", label: "FAQ" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
      <span className="grid size-[30px] place-items-center rounded-[9px] bg-primary font-mono text-[0.8rem] font-semibold text-primary-foreground">
        py
      </span>
      {brand.name}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Utama" className="hidden gap-6 text-[0.92rem] font-semibold text-muted-foreground md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <ThemeToggle label="Ganti mode terang/gelap" />
          {/* shortcut: auth routes arrive with #11; these point at the page until then. */}
          <a href="#harga" className="hidden px-1.5 py-2 text-[0.92rem] font-semibold sm:block">
            Masuk
          </a>
          <Button asChild size="lg" className="px-3.5 font-bold">
            <a href="#harga">Mulai gratis</a>
          </Button>
        </div>
      </Container>
    </header>
  );
}
