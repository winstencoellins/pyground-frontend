import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["id", "en"],
  defaultLocale: "id",
  // Always /id/... or /en/...; "/" redirects by NEXT_LOCALE cookie, then Accept-Language, then id.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
