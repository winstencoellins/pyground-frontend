import { setRequestLocale } from "next-intl/server";
import { AppHeader } from "@/components/app/app-header";

/** Public learning pages (lesson list, lessons): app header, no sign-in required. */
export default async function LearnLayout({ children, params }: LayoutProps<"/[locale]">) {
  setRequestLocale((await params).locale as "id" | "en");
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-10 sm:px-6">{children}</main>
    </>
  );
}
