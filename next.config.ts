import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Where pyground-api runs. Read at build time (rewrites are compiled into the build), so set it before `next build`.
const apiUrl = process.env.API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
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
