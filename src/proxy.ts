import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { isProtected } from "./config/routes";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);
const localized = new RegExp(`^/(${routing.locales.join("|")})(/.*)?$`);

/**
 * 1. Protected pages without a session cookie go to sign-in (?next= brings them back). This is only a fast,
 *    optimistic check: the (app) layout asks the API whether the session is real.
 * 2. Everything else: locale prefix (cookie > Accept-Language > id) and hreflang Link headers.
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const match = pathname.match(localized);
  const path = match?.[2] ?? "";
  if (match && isProtected(path) && !getSessionCookie(request)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${match[1]}/sign-in`;
    url.search = `?next=${encodeURIComponent(path + search)}`;
    return NextResponse.redirect(url);
  }
  return intl(request);
}

export const config = {
  // Everything except API calls, Next internals and files with an extension (icon.svg, robots.txt...).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
