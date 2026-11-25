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

## Landing price

The access pass price on the landing page comes from the API (`GET /api/payments/pass`, the same config checkout
charges), cached for hours. It renders per request inside `<Suspense>` (`src/components/landing/pass-price.tsx`)
because the API isn't reachable while the web app builds; if the API is down the card says the price is shown at
checkout, and the next request tries again.

## SEO

- Each indexable page calls `pageMeta()` (`src/lib/seo.ts`): its own canonical, `id`/`en`/`x-default` hreflang and
  Open Graph text. Don't put a canonical in a layout: every child page would inherit it. An English lesson URL that
  falls back to Indonesian text is canonical to the Indonesian page.
- Not indexed: sign-in/up and other auth pages, the signed-in area, and locked lessons (crawlers only see the paywall).
- `src/app/robots.ts` keeps crawlers out of `/api/` and the signed-in prefixes; `src/app/sitemap.ts` lists home, the
  curriculum and the free lessons in both languages, fetched from the API per request (cached for hours).
- `src/app/[locale]/opengraph-image.tsx` renders the share card per language.
- `NEXT_PUBLIC_SITE_URL` must be the public origin in production: canonical, hreflang, sitemap and share-card URLs use it.

## Billing

`/{locale}/billing` (signed in): access status, the pass price, a buy / extend button and the order history (pending
orders link to their status page). The button calls `POST /api/payments/checkout` and sends the learner to Midtrans'
hosted Snap page (`redirectUrl`), so this app needs no Midtrans key or script. Snap returns to
`/payment/result?orderId=…`, which calls `POST /api/payments/orders/:orderId/sync` (the API asks Midtrans and applies
the result) and polls while the order is pending. The query string Snap appends (`transaction_status=…`) is ignored.

Sandbox test card: `4811 1111 1111 1114`, any future expiry, CVV `123`, 3-D Secure OTP `112233`.

## Dashboard

`/{locale}/dashboard` (signed in): greeting and access status, a "continue learning" card (the first unfinished lesson
after the most recently completed one, `src/lib/continue.ts`), the learning streak from `GET /api/progress`, and
progress per stage with links into each stage.

## Lessons

`/{locale}/lessons` lists the curriculum and `/{locale}/lessons/[slug]` renders one lesson. The API serves the MDX
source (`src/lib/lessons.ts`); `src/components/lesson/lesson-content.tsx` compiles it on the server with MDX 3 + GFM and
maps elements to Pyground typography. Lesson components live in `src/components/lesson/` (`blocks.tsx`,
`playground.tsx`, `quiz.tsx`, `diagrams.tsx`). Free lessons are public; locked ones show a sign-in / pricing panel.
Lessons use animations, not videos.

Lesson pages have the current stage's lessons beside them (`lesson-nav.tsx`: a sticky sidebar on large screens, a
collapsible list on small ones), with ticks and a stage progress bar from `GET /api/progress` for signed-in learners.
Under each lesson: "Mark as complete" (`complete-button.tsx`, `POST /api/progress/:slug/complete`, then a refresh so
the ticks update) or a sign-in link, and previous / next links in curriculum order.

The quiz gives feedback right after each answer (answers lock), shows the score when every question is answered, and
then posts `{ score, answers }` to `POST /api/quiz/:slug/attempts` for signed-in learners (visitors get a sign-in link).
A question with `code` is a "predict the output" question: the snippet shows above the options.

`<AnimatedDiagram name="…" />` picks a diagram from `diagrams.tsx` (`instructions-flow`, `for-loop`, `try-except-flow`,
`request-response`); an unknown name shows just the caption. Each is a few steps on a shared player that autoplays only
while on screen, never with reduced motion, and can be paused or stepped by hand. Diagram text lives in the `Diagrams`
messages; to add one, write a component there and add its name to the `diagrams` map.

### Playground (Python in the browser)

`src/components/lesson/playground.tsx` is a CodeMirror 6 editor; `src/lib/python/runner.ts` runs code in
[Pyodide](https://pyodide.org) inside one shared Web Worker, `public/python-worker.mjs`.

- The worker is a static module file, not bundled: Turbopack only builds classic workers, and Pyodide 314 needs a module
  worker. Pyodide itself loads from `cdn.jsdelivr.net` (~12 MB the first time, then from the browser cache). Python is
  fetched on the first Run or when an editor gets focus, never on page load.
- `input()` works without `SharedArrayBuffer` (which would need COOP/COEP headers that break YouTube embeds and Midtrans
  Snap): when the program asks for input, the run stops, the page shows an answer box, and the program is run again from
  the start with all answers so far. `random` is seeded once per Run so the replays match.
- Runs stop after 10 s (the worker is killed and Python reloads from cache) or after 20,000 characters of output.
  Tracebacks only show the learner's `main.py` lines. Ctrl/⌘ + Enter runs; Reset restores the lesson's code.
- To upgrade Pyodide, change the version in `public/python-worker.mjs` (both URLs) and `src/lib/python/config.ts`.

## Environment

| Variable               | Purpose                                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `API_URL`              | pyground-api origin (default `http://localhost:3001`). Needed at **build** time (the rewrite) and at **run** time (server-side calls, e.g. the landing price). |
| `NEXT_PUBLIC_SITE_URL` | Public origin for canonical and hreflang URLs (default `http://localhost:3000`).                                                                               |

## Design

- **Palette "Nila & Merah"**: every color is a CSS variable in `src/app/globals.css` (light in `:root`, dark in
  `.dark`). Components use the token names (`bg-primary`, `text-muted-foreground`, `bg-highlight`…), never raw hex.
  `highlight` (merah) is for small marks like badges and underlines only, never for errors (`destructive`).
- **Fonts**: Plus Jakarta Sans (text) and JetBrains Mono (code), self-hosted through `next/font` in `src/app/layout.tsx`.
- **Dark mode**: `next-themes` toggles the `.dark` class; default follows the system.
- **Brand constants**: `src/config/brand.ts`.
- **shadcn/ui** components go in `src/components/ui` (`bunx shadcn@4.23.0 add <name>`).
