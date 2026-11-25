import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Where pyground-api runs. Read at build time (rewrites are compiled into the build), so set it before `next build`.
const apiUrl = process.env.API_URL ?? "http://localhost:3001";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const https = siteUrl.startsWith("https://");
const dev = process.env.NODE_ENV === "development";
// Python (Pyodide) loads from here, inside public/python-worker.mjs. A path, so the rest of jsDelivr stays blocked.
const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/";

/**
 * Page CSP. Static, not nonce-based: nonces would force every page to render per request and disable the
 * prerendered shells (PPR). Next's bootstrap is inline, so scripts need 'unsafe-inline'; what the policy still
 * guarantees: scripts only from this origin + jsDelivr (Pyodide), no plugins, no framing, no foreign <base> or
 * form posts. 'wasm-unsafe-eval' lets Pyodide compile WebAssembly (no 'unsafe-eval' needed). Midtrans Snap is a full-page redirect, so it
 * needs nothing here. The API (/api/*) sends its own `default-src 'none'`.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' ${PYODIDE_CDN}${dev ? " 'unsafe-eval'" : ""}`,
  // Chrome checks a module worker's imports against the page's worker-src, so the CDN is needed here too.
  `worker-src 'self' ${PYODIDE_CDN}`,
  `connect-src 'self' ${PYODIDE_CDN}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Only behind HTTPS: on http://localhost it would upgrade requests to an origin that doesn't exist.
  ...(https ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(https ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    // Everything except the proxied API, whose JSON responses carry the API's own headers.
    return [{ source: "/((?!api/).*)", headers: securityHeaders }];
  },
  // The browser only talks to this origin: /api/* is proxied to the API, so Better Auth's session cookie is
  // first-party here (the API's BETTER_AUTH baseURL is WEB_URL for the same reason).
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
