import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { brand } from "@/config/brand";
import { Container } from "./ui";

const links = [
  { href: "#cara", label: "Kenapa Pyground" },
  { href: "#kurikulum", label: "Kurikulum" },
  { href: "#harga", label: "Harga" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 bg-background/85 backdrop-blur">
      <Container className="grid h-[72px] grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex w-fit items-center gap-2.5 text-[1.15rem] font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-full bg-foreground font-mono text-[0.78rem] font-semibold text-background">
            py
          </span>
          {brand.name}
        </Link>
        <nav aria-label="Utama" className="hidden gap-7 text-[0.9rem] font-medium text-muted-foreground md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <ThemeToggle label="Ganti mode terang/gelap" />
          {/* shortcut: auth routes arrive with #11; these point at the page until then. */}
          <a href="#harga" className="hidden px-1.5 text-[0.9rem] font-semibold sm:block">
            Masuk
          </a>
          <a
            href="#harga"
            className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-[0.88rem] font-semibold text-background outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
          >
            Mulai gratis
          </a>
        </div>
      </Container>
    </header>
  );
}
