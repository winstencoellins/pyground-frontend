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
bun run build
```

## Design

- **Palette "Nila & Merah"**: every color is a CSS variable in `src/app/globals.css` (light in `:root`, dark in
  `.dark`). Components use the token names (`bg-primary`, `text-muted-foreground`, `bg-highlight`…), never raw hex.
  `highlight` (merah) is for small marks like badges and underlines only, never for errors (`destructive`).
- **Fonts**: Plus Jakarta Sans (text) and JetBrains Mono (code), self-hosted through `next/font` in `src/app/layout.tsx`.
- **Dark mode**: `next-themes` toggles the `.dark` class; default follows the system.
- **Brand constants**: `src/config/brand.ts`.
- **shadcn/ui** components go in `src/components/ui` (`bunx shadcn@4.23.0 add <name>`).
