# pyground-frontend

Web app for **Pyground**, an interactive Python course for Indonesian beginners, supported by Trixync.
Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui, bun. The API lives in
[pyground-backend](https://github.com/winstencoellins/pyground-backend).

## Run it

```bash
bun install
bun dev                    # http://localhost:3000
```

The landing page runs on its own. Pages that talk to the API (sign-in, lessons, billing) also need the
backend running: in `pyground-backend/`, `docker compose up -d --wait` then `bun run dev` (API on :3001).

```bash
bun run typecheck && bun run lint && bun run format:check
bun run test               # unit tests (bun test)
bun run build
```

## Languages

Every page lives under `/id/...` (default) or `/en/...` (next-intl, `src/i18n/`). Visiting `/` redirects by the
`NEXT_LOCALE` cookie (set by the ID/EN switch), then the browser's `Accept-Language`, then Indonesian. All UI text is
in `messages/id.json` (source of truth, type-checked) and `messages/en.json`; never hardcode copy in components.
Language detection runs in `src/proxy.ts` (Next 16's renamed middleware).

## Talking to the API

The browser only ever calls this origin: `next.config.ts` rewrites `/api/*` to `API_URL`, so Better Auth's session
cookie is first-party (the API's `WEB_URL` must be this site's origin). Use the typed Eden client:

- `src/lib/api.ts` (`api`) in client components: `const { data, error } = await api.api.lessons.get({ query: { locale } })`.
- `src/lib/api-server.ts` (`await serverApi()`) in server components: calls the API directly and forwards the visitor's
  cookies.

Types come from `@winstencoellins/pyground-api-types`. Until a GitHub Packages token is set up, it is installed from the
sibling backend checkout (`file:../pyground-backend/types-package`); after API changes run `bun run types:build` in the
backend, then `bun install --force` here. To switch to the published package, add an `.npmrc` with
`@winstencoellins:registry=https://npm.pkg.github.com` and a `read:packages` token, and set the dependency to its version.
`tsconfig.json` has `preserveSymlinks` so the linked types use this app's `elysia`.

## Sign-in

Better Auth's React client (`src/lib/auth-client.ts`) talks to `/api/auth/*` on this origin. Pages live in
`src/app/[locale]/(auth)`: sign-up, sign-in, verify-email, forgot-password, reset-password. Email verification is
required; links land on `/{locale}/verify-email?verified=1` (signed in) or with `?error=`. `?next=/path` on sign-in
returns there afterwards (same-site paths only, see `src/lib/safe-next.ts`). To try it locally the API must run with
`WEB_URL` set to this site's origin.

## Signed-in area

Pages in `src/app/[locale]/(app)` share the app header (nav, language, theme, sign out) and are protected twice:

1. `src/proxy.ts` sends visitors without a session cookie on a protected path (`src/config/routes.ts`) to
   `/{locale}/sign-in?next=...` before anything renders.
2. The `(app)` layout's `AuthGate` asks the API (`getMe()` in `src/lib/session.ts`) and redirects expired or forged
   sessions to sign-in. Use `getMe()` in pages for the current user; it is deduped per request.

Free lessons stay public; the API decides which lessons need a pass. New protected sections: add their prefix to
`PROTECTED_PREFIXES`.

## Lessons

`/{locale}/lessons` lists the curriculum and `/{locale}/lessons/[slug]` renders one lesson. The API serves the MDX
source (`src/lib/lessons.ts`); `src/components/lesson/lesson-content.tsx` compiles it on the server with MDX 3 + GFM and
maps elements to Pyground typography. Lesson components live in `src/components/lesson/blocks.tsx`. Playground, Quiz,
AnimatedDiagram and VideoEmbed are read-only stand-ins until #14, #15 and #16. Free lessons are public; locked ones
show a sign-in / pricing panel.

## Environment

| Variable               | Purpose                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `API_URL`              | pyground-api origin (default `http://localhost:3001`). Read at **build** time by the rewrite. |
| `NEXT_PUBLIC_SITE_URL` | Public origin for canonical and hreflang URLs (default `http://localhost:3000`).              |

## Design

- **Palette "Nila & Merah"**: every color is a CSS variable in `src/app/globals.css` (light in `:root`, dark in
  `.dark`). Components use the token names (`bg-primary`, `text-muted-foreground`, `bg-highlight`…), never raw hex.
  `highlight` (merah) is for small marks like badges and underlines only, never for errors (`destructive`).
- **Fonts**: Plus Jakarta Sans (text) and JetBrains Mono (code), self-hosted through `next/font` in `src/app/layout.tsx`.
- **Dark mode**: `next-themes` toggles the `.dark` class; default follows the system.
- **Brand constants**: `src/config/brand.ts`.
- **shadcn/ui** components go in `src/components/ui` (`bunx shadcn@4.23.0 add <name>`).
