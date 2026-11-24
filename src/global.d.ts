import type { routing } from "@/i18n/routing";
import type messages from "../messages/id.json";

// Type-checks translation keys and locales against the Indonesian messages (the source of truth).
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
