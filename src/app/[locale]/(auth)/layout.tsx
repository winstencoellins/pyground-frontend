import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";

/** Auth pages: the split shell, plus the Auth messages for the client-side forms (and nothing else). */
export default async function AuthLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = (await params).locale as "id" | "en";
  setRequestLocale(locale); // static rendering: no request headers needed
  const { Auth } = await getMessages({ locale });
  return (
    <NextIntlClientProvider messages={{ Auth }}>
      <AuthShell>{children}</AuthShell>
    </NextIntlClientProvider>
  );
}
