import { redirect } from "@/i18n/navigation";
import { getMe } from "@/lib/session";

/**
 * Server-side session check for the signed-in area. The proxy already bounced visitors without a cookie;
 * this catches expired or forged ones. Sign-in never redirects on cookies, so there is no loop.
 */
export async function AuthGate({ locale, children }: { locale: "id" | "en"; children: React.ReactNode }) {
  if (!(await getMe())) redirect({ href: "/sign-in", locale });
  return children;
}
