"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/** ID | EN segmented switch. next-intl stores the choice in the NEXT_LOCALE cookie; signed-in users also on their account. */
export function LocaleSwitcher({ label, names }: { label: string; names: Record<string, string> }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { data: session } = useSession();

  const choose = (l: (typeof routing.locales)[number]) => {
    // Signed in: remember it on the account too, so emails and other devices use it. Best effort.
    if (session) void api.api.me.patch({ locale: l }).catch(() => {});
    startTransition(() => router.replace(pathname, { locale: l }));
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex rounded-full border bg-card p-0.5", pending && "opacity-60")}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-label={names[l]}
          aria-pressed={l === locale}
          onClick={() => choose(l)}
          className={cn(
            "h-8 rounded-full px-2.5 text-[0.75rem] font-semibold uppercase outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
            l === locale ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
