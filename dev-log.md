# Dev Log – TetraMaster UI Visual Parity

## 2026-02-06 – Visual Parity Overhaul

### Goal
Bring the web app's TetraMaster UI as close as possible (visually) to the in-game FF9 Tetra Master screen, using only original CSS/SVG and permissive-license fonts. No copyrighted assets added.

### Observations (Before)
- The app used a warm brown/amber palette (`classic` theme) that didn't match the in-game deep-blue UI
- Layout was vertical: board on top, both player hands stacked below
- Card stats displayed as a 2×2 grid of individual stat badges
- Board cells had rounded corners and modern styling
- No board frame or beveled cell effects
- Arrows were functional but lacked glow/polish
- No active-player turn indicator on hands
- Card art backgrounds (procedural) used brown tones
- Typography was plain system sans-serif throughout

### Visual Reference (In-Game FF9 Tetra Master)
- Deep navy/indigo backgrounds with gold/amber accent UI elements
- 4×4 board with beveled, inset cells and an ornate gold frame
- Horizontal layout: P1 hand (left) | Board (center) | P2 hand (right)
- Card stats shown as single-row hex code: "1P08" (power, class, physical, magical)
- Gold arrow indicators on card edges with subtle glow
- Player 1 = blue tint, Player 2 = red tint
- Clean HUD bar at top with turn/score info
- Dramatic dark battle overlay with gold accents

### Changes Made

#### 1. Design Tokens (Classic Theme)
- Replaced warm brown palette with deep navy/indigo: `--bg: #06091a`, `--surface: #0d1230`
- Gold accents: `--accent: #c9a84c`, `--accent-strong: #f0d060`
- Added frame variables: `--frame-outer`, `--frame-mid`, `--frame-inner`, `--frame-highlight`
- Added cell-specific variables: `--cell-bg`, `--cell-border-light`, `--cell-border-dark`
- Player colors refined: blue (#4e9ade) and red (#de5a5a)

#### 2. Google Fonts
- Added Cinzel (OFL) for titles/branding – fantasy/medieval feel
- Added JetBrains Mono (OFL) for card stats and HUD numbers

#### 3. Layout Restructure (PlayPage)
- Horizontal arena layout: P1 hand | Board frame | P2 hand
- Each hand has a styled header with player name and score
- Active turn indicator (glow on active player's hand panel)
- Responsive: stacks vertically on narrow viewports (<740px)

#### 4. Board
- Gold beveled frame wrapper (`game__board-frame`) with gradient and inner border
- Beveled inset cells with `box-shadow` (lighter top-left, darker bottom-right)
- Cross-hatch pattern for blocked cells
- Subtle hover glow on empty cells
- Cards fill their cells responsively

#### 5. Cards
- Stats displayed as single-row hex code (e.g., "1P08") using JetBrains Mono
- Card name hidden on small cards (board), shown on medium/large
- Vignette overlay on card art for depth
- Reduced border-radius (2-4px) for more angular game-like look
- Enhanced owner tinting with gradients and colored shadows
- Selection pulse animation
- Hover lift effect on interactive cards
- Face-down card back with diagonal pattern and Cinzel "TM" text

#### 6. Arrows
- Gold drop-shadow glow filter
- Slightly adjusted positioning for compact cards

#### 7. Battle Modal
- Gold border frame with inner border line (classic theme)
- Cinzel typography for title and result text
- Enhanced bump/winner animations
- Darker backdrop

#### 8. HUD & UI Chrome
- Compact header with Cinzel brand title in gold
- Nav links with active state underline
- Panels with gold border accents (classic theme)
- Buttons with gold gradient (primary) and subtle hover effects
- Winner announcement with pulsing gold glow animation
- Radial background on game area for visual focus

#### 9. Procedural Art Palette
- Updated classic palette from brown to deep-blue tones matching new theme

### Verification
- `npx tsc -b` – passes (no type errors)
- `npm run build` – passes (production build clean)
- `npm test` – 7/7 tests pass
- `npm run lint` – only pre-existing warnings (not introduced by these changes)
- No new binary/image assets added to repository
- Existing card art paths unchanged (`/generated/{cardId}.png`)
- All game logic/rules untouched – only presentational layer modified

### Files Modified
| File | Change |
|------|--------|
| `index.html` | Google Fonts preconnect + stylesheet |
| `src/index.css` | Complete visual overhaul (~1400 lines) |
| `src/ui/pages/PlayPage.tsx` | Horizontal arena layout, HUD, turn indicator |
| `src/ui/pages/HomePage.tsx` | Text refinements |
| `src/ui/components/CardView.tsx` | Single-row stat code format |
| `src/ui/components/Layout.tsx` | Brand subtitle update |
| `src/services/proceduralArt.tsx` | Classic palette updated to deep-blue |
