# TetraMaster card art generation

Generate card art for all 100 TetraMaster cards using Stable Diffusion (A1111 API). The pipeline was adapted from a Dixit-clone card art generator; the logic here is TetraMaster-specific and has no runtime dependency on that project.

## Pipeline

1. **Prompt generation** – Reads `src/data/cards.json`, builds one prompt per card (fantasy creature illustration, class-based flavour, shared style and negative prompt), assigns a deterministic seed per card ID, and writes `tetramaster/art/prompts/prompts.json`.
2. **Image generation** – Reads `prompts.json`, calls the Stable Diffusion API (txt2img) for each card, and saves PNGs to `tetramaster/art/output/{id}.png` (e.g. `001.png` … `100.png`).

## Requirements

- Node.js 18+ (for running scripts).
- A running Stable Diffusion API compatible with [A1111](https://github.com/AUTOMATIC1111/stable-diffusion-webui) (e.g. `http://localhost:7860`). Use `SD_URL` (or `STABLE_DIFFUSION_URL`) to override.

## Running locally (no Docker)

From the **repository root**:

```bash
# 1. Generate prompts (always run first; creates/overwrites prompts.json)
node tetramaster/art/scripts/generate-prompts.mjs

# 2. Generate images (requires SD API at SD_URL, default http://localhost:7860)
node tetramaster/art/scripts/generate-images.mjs
```

Or run both in sequence:

```bash
node tetramaster/art/scripts/run-all.mjs
```

## Running with Docker

From the **repository root**:

```bash
# Start Stable Diffusion (optional; if you already have SD elsewhere, set SD_URL when running the generator)
docker compose -f tetramaster/art/docker-compose.art.yml up -d stable-diffusion

# Run the full pipeline (prompts + images). Generator service uses SD_URL to talk to the SD container or host.
docker compose -f tetramaster/art/docker-compose.art.yml run --rm generator
```

To use an existing SD instance on the host:

```bash
# Windows (PowerShell)
$env:SD_URL = "http://host.docker.internal:7860"
docker compose -f tetramaster/art/docker-compose.art.yml run --rm generator

# Linux/macOS
SD_URL=http://host.docker.internal:7860 docker compose -f tetramaster/art/docker-compose.art.yml run --rm generator
```

## Outputs

- **Prompts:** `tetramaster/art/prompts/prompts.json` – 100 entries with `id`, `name`, `prompt`, `negativePrompt`, `seed`.
- **Images:** `tetramaster/art/output/001.png` … `tetramaster/art/output/100.png` (gitignored).

## Validation

- Prompt dataset: exactly 100 entries; one per card in `src/data/cards.json`.
- Seeds: deterministic from card ID; re-running prompt generation yields the same seeds.
- After image generation: 100 PNG files in `tetramaster/art/output/` with stable filenames `001.png`–`100.png`.

## Integration with the game

The game’s existing art pipeline can use these images by placing them in `public/generated/{id}.png` and using the appropriate art provider (e.g. `generated` or `local`). This art pipeline only produces the assets; it does not change game code.
