# Dev Log: TetraMaster UI Visual Parity

## 2026-02-06 – Visual Parity Overhaul

### Objective

Bring the web app's TetraMaster UI as close as possible to the in-game FFIX Tetra Master interface, using only original CSS/SVG and permissive fonts. No copyrighted assets added.

### Observations (Before)

- Classic theme used warm brown tones (#1c1410, #2b1f1a) — diverges from the dark navy/blue-gold palette of the in-game Tetra Master
- Board was a flat grid with rounded 12px cells and no frame/border
- Card stats displayed in a 2x2 grid below the art area (not matching the in-game single-row hex format)
- Arrows lacked visibility/drop-shadow
- No turn indicator visual, no player-colored hand accents
- Generic sans-serif typography everywhere (Inter only)
- Battle dialog used basic rounded panel, no ornate framing
- Cards on board looked identical to cards in hand (no board-specific overlay)

### Changes Made

#### 1. Design Tokens & Fonts (`index.html`, `src/index.css`)
- Added Google Fonts: **Cinzel** (display/headings — OFL license) and **JetBrains Mono** (stats/mono — OFL license)
- Defined `--font-display` and `--font-mono` CSS custom properties

#### 2. Classic Theme Color Overhaul (`src/index.css`)
- Background: `#0c0e1c` (dark navy-black)
- Surfaces: `#141828` / `#1c2038` (dark blue-gray)
- Text: `#e4d8c0` (warm cream/parchment)
- Accent: `#c9a646` / `#f0d060` (gold/amber)
- Player colors: `#5ba8d6` (blue) / `#d65b5b` (red)
- Added 12+ new CSS variables for board, cells, cards, glows, frames

#### 3. Modern Theme Enhancement (`src/index.css`)
- Added matching new CSS variables (board-bg, cell-bg, glow, frame-gradient, etc.)
- Both themes now use the full extended variable set

#### 4. Board Visual Parity
- Board frame: 2px border with gold accent pseudo-element, inset depth shadow, diagonal gradient background
- Board frame glow animation (4s breathe cycle)
- Cells: beveled inset look, stone-like appearance with `box-shadow`
- Cell hover: gold/accent glow + border highlight
- Blocked cells: cross-hatch pattern at 50% opacity
- Board max-width 580px centered with padding

#### 5. Card Visual Parity
- Card frame: 2px border, subtle player-color tint, drop-shadow
- Card stats: single flex row (`1P23` hex format), monospace, dark stat-bg band
- Card art: vignette effect (`box-shadow: inset`)
- Card arrows: drop-shadow for visibility, player-colored glow per owner
- Card selection: gold outline + pulsing glow animation (1.8s)
- Card hover: 2px lift with enhanced shadow
- Face-down cards: decorative checkerboard pattern background, Cinzel "TM"
- Board cards: stats overlaid on card face, name hidden, cards fill cell width

#### 6. HUD / Game Status
- Status bar: gradient background, border-radius, shadow
- Turn indicator: mono font, gold color
- Active player: colored left-border accent (blue/red)
- Scores: player-colored text, mono font
- Winner text: Cinzel display font, gold glow animation (2s breathe)

#### 7. Hand Panels
- Gradient background, 3px player-colored accent strip at top
- Player-colored heading text (Cinzel)
- Centered card layout

#### 8. Battle Dialog
- Ornate frame: gradient background, 2px border, gold accent shadow
- Title: Cinzel uppercase, gold glow
- Labels: mono uppercase
- Winner/loser states: enhanced glow/grayscale
- Battle animations: larger bump distances, stronger depth

#### 9. Navigation & Layout
- Header: gradient background, shadow
- Brand title: Cinzel with gold glow
- Nav links: border-based active state, hover transitions
- Panels: gradient backgrounds, inset highlight, shadow
- Buttons: gradient primary (gold), hover lift
- Pages: max-width 1100px centered
- Headings: Cinzel display font, gold/accent colors
- Custom scrollbar styling

#### 10. Home Page
- Hero panel: gold accent line at top
- Feature tiles: Cinzel font, accent color
- Eyebrow text: uppercase, accent-colored

#### 11. Procedural Art (`src/services/proceduralArt.tsx`)
- Updated classic palette to match new dark navy/gold theme

#### 12. Responsive (`src/index.css`)
- 640px breakpoint: smaller padding, 4px board gap, 90px card width, stacked battle arena

### Files Modified
- `index.html` — Google Fonts preconnect + stylesheet links
- `src/index.css` — Complete visual overhaul (~1390 lines)
- `src/ui/pages/PlayPage.tsx` — `data-player` on hands, `data-active-player` on status, turn text refinement
- `src/services/proceduralArt.tsx` — Updated classic palette

### Verification
- `tsc -b`: Clean (0 errors)
- `npx vite build`: Success (18.7 KB CSS gzipped to 4.5 KB)
- `npm test`: 7/7 tests pass
- `npm run lint`: 2 pre-existing warnings (not related to this PR)
- `npx prettier --check`: All changed files pass
- `git diff --diff-filter=A`: No new files added (no copyrighted assets)
- Card image paths unchanged (generated art at `/generated/{id}.png`)
