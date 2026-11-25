"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function AppNav({
  label,
  items,
  className,
}: {
  label: string;
  items: { href: string; label: string; exact?: boolean }[];
  className?: string;
}) {
  const pathname = usePathname();
  return <NavLinks label={label} items={items} className={className} active={pathname} />;
}

/** Plain links; `active` is the current path, or undefined when it isn't known yet (Suspense fallback). */
export function NavLinks({
  label,
  items,
  className,
  active,
}: {
  label: string;
  items: { href: string; label: string; exact?: boolean }[];
  className?: string;
  active?: string;
}) {
  return (
    <nav aria-label={label} className={cn("flex items-center gap-1 text-[0.9rem] font-medium", className)}>
      {items.map((item) => {
        const current =
          active !== undefined && (active === item.href || (!item.exact && active.startsWith(`${item.href}/`)));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1.5",
              current ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
