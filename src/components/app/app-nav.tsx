"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function AppNav({
  label,
  items,
  className,
}: {
  label: string;
  items: { href: string; label: string }[];
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className={cn("flex items-center gap-1 text-[0.9rem] font-medium", className)}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1.5",
              active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
