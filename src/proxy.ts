import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Adds the locale prefix (cookie > Accept-Language > id) and hreflang Link headers.
export default createMiddleware(routing);

export const config = {
  // Everything except API calls, Next internals and files with an extension (icon.svg, robots.txt...).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
