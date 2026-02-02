# Tetra Master (React + Vite)

Playable, browser-based recreation of Final Fantasy IX's Tetra Master using original UI and art. The
rules engine is deterministic, unit-tested, and UI-agnostic.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Docker

```bash
docker compose up --build
```

Open http://localhost:5173

### Scripts

- `npm run dev` - Vite dev server
- `npm run build` - production build
- `npm run preview` - serve the build
- `npm run test` - Vitest unit tests
- `npm run lint` - ESLint
- `npm run format` - Prettier
- `npm run gen:art` - optional local art generation

## Project structure

```
src/
  ai/         AI opponents and evaluation
  data/       Card data (100 cards)
  engine/     Pure rules engine
  services/   Art providers and integrations
  state/      Zustand stores
  ui/         React UI components and pages
tests/        Vitest unit tests
```

## Rules summary (with citations)

Sources:
- https://finalfantasy.fandom.com/wiki/Tetra_Master_(minigame)
- https://finalfantasy.fandom.com/wiki/Final_Fantasy_IX/Manual/North_America

Highlights:
- The board is a 4x4 grid. Up to six random blocked squares may appear before a match.
- Each player brings five cards. Players alternate placing a card into an empty square.
- Cards have four stats: power, battle class, physical defense, magical defense.
- Arrows on a placed card can capture adjacent enemy cards.
- If arrows face each other, a battle occurs. The battle result is determined in three phases:
  1) Randomly select a stat value within each card's hex-defined range.
  2) Roll a random number between 0 and the chosen stat value for attack and defense.
  3) Subtract the rolls from the base values; the higher remaining value wins.
- Battle classes:
  - P: power vs physical defense
  - M: power vs magical defense
  - X: power vs lower defense
  - A: strongest of attacker stats vs weakest of defender stats
- Combos: when a card wins a battle, arrows on the defeated card can flip additional adjacent cards.

## Card data

The 100 card definitions are stored in `src/data/cards.json`, generated from:
- https://finalfantasy.fandom.com/wiki/Final_Fantasy_IX_Tetra_Master_cards

`tests/data/cards.test.ts` enforces that the dataset contains exactly 100 unique cards.

### Arrow patterns

The card list sources do not include fixed arrow layouts. This implementation generates arrow
patterns per card instance (matching the in-game variation) and lets you reroll arrows in the deck
builder. Arrow density is adjustable in Settings.

Original arrow generation (optional) follows the game's distribution for arrow counts. The
Memoria open-source project documents the same algorithm used in FFIX:

- Arrow count distribution (0-8 arrows): 1, 8, 25, 31, 18, 9, 5, 2, 1 out of 100.
- After choosing the count, arrow directions are selected randomly from the eight directions.

Source:
https://github.com/Albeoris/Memoria/blob/main/Assembly-CSharp/Global/Card/CardPool.cs

### Deck rules

- Deck size: 5 cards.
- Duplicates: allowed (multiple copies of the same card are valid).

## Gameplay modes

- Player vs AI
- AI vs AI (spectate)
- Local hotseat (two humans)

## AI

- Easy: greedy evaluation
- Medium: depth-2 alpha-beta
- Hard: iterative deepening alpha-beta with time budget

AI is deterministic by default; enable randomness in Settings if desired.

## Optional local art integration

By default, cards render with procedural SVG art. To use locally generated art:

1) Provide a local image endpoint that accepts:

```
POST /card
{ "id": "001", "name": "Goblin", "seed": "001" }

Response:
{ "dataUrl": "data:image/png;base64,..." }
```

2) Configure environment variables:

```
VITE_ART_PROVIDER=local
VITE_LOCAL_ART_ENDPOINT=http://localhost:8081/card
```

3) (Optional) Pre-generate images into `public/generated`:

```
LOCAL_ART_ENDPOINT=http://localhost:8081/card npm run gen:art
```

Then set:

```
VITE_ART_PROVIDER=generated
```

No paid APIs are required. The game remains fully playable with procedural art.

## Notes and assumptions

- Card stat upgrades across matches are not implemented; each match uses deck card stats as-is.
- Assault battle (class A) uses the strongest attacker stat vs the weakest defender stat, based on
  the rules reference wording.
- Battle ties resolve in favor of the defending card.

## Troubleshooting

- If the page is blank, check the browser console for errors and verify Vite is running.
- If AI feels slow, lower the time budgets in Settings.
