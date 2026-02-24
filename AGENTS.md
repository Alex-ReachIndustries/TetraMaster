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

- You must create a deck in the Deck Builder before starting a match; the Play page will not let you start without one.
- The local-art-server (`local-art-server/`) is entirely optional and only needed with `VITE_ART_PROVIDER=local`. Default procedural SVG art works without it.
- Node.js 20+ is required (project Dockerfile uses `node:20-slim`; Node 22 also works).
