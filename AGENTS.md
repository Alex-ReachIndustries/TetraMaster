# AGENTS.md

## Cursor Cloud specific instructions

This is a single-package React + Vite SPA (Tetra Master card game). No backend, no database, no external services required.

### Services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Vite dev server | `npm run dev` | 5173 | Only required service |

### Standard commands

See `README.md` and `package.json` scripts for full details. Key commands:

- **Dev server:** `npm run dev`
- **Lint:** `npm run lint` (ESLint; 2 pre-existing react-hooks warnings in `PlayPage.tsx`)
- **Test:** `npm run test` (Vitest, 7 unit tests)
- **Build:** `npm run build` (tsc + vite build)
- **Format:** `npm run format` (Prettier)

### Gotchas

- **Free Play** requires creating a deck in the Deck Builder first; the Play page won't start without one.
- **Journey Mode** has its own deck/collection system — no manual deck creation needed.
- Campaign state is persisted in localStorage (`tetra-master-campaign`). Click "Reset Campaign" to regenerate cards after code changes to card generation.
- Arrow generation uses `'original'` mode (FF9 distribution) in campaign with `minArrows` guarantees so no card is ever useless.
- The local-art-server (`local-art-server/`) is entirely optional and only needed with `VITE_ART_PROVIDER=local`. Default procedural SVG art works without it.
- Node.js 20+ is required (project Dockerfile uses `node:20-slim`; Node 22 also works).
