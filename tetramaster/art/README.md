# TetraMaster card art generation

Generate card art for all 100 TetraMaster cards using **local** Stable Diffusion (A1111 API in Docker). No API key required. The pipeline was adapted from the [Story_Teller](https://github.com) Dixit-clone card art generator; the logic here is TetraMaster-specific.

## Pipeline

1. **Prompt generation** – Reads `src/data/cards.json`, builds one prompt per card (fantasy creature illustration, class-based flavour, shared style and negative prompt), assigns a deterministic seed per card ID, and writes `tetramaster/art/prompts/prompts.json`.
2. **Image generation** – Reads `prompts.json`, calls the Stable Diffusion API (txt2img) running in Docker, and saves PNGs to `tetramaster/art/output/{id}.png` (e.g. `001.png` … `100.png`).

## Requirements

- **Docker** (and Docker Compose). For full local generation, an **NVIDIA GPU** is recommended (see `MODELS.md`).
- Optional: Node.js 18+ to run scripts without Docker.

## Running with Docker (recommended – local, no API key)

From the **repository root**, one command runs prompt generation and then image generation. Docker starts the Stable Diffusion container (if needed), waits for it to be ready, then generates all 100 images:

```bash
docker compose -f tetramaster/art/docker-compose.art.yml run --rm generator
```

- The first run may take a while while the SD WebUI image starts and loads a model (see `MODELS.md` for model options).
- Output: `tetramaster/art/output/001.png` … `100.png` and `tetramaster/art/output/manifest.json`.

To use an existing Stable Diffusion instance on the host instead of the container:

```bash
# Windows (PowerShell)
$env:SD_URL = "http://host.docker.internal:7860"
docker compose -f tetramaster/art/docker-compose.art.yml run --rm generator

# Linux/macOS
SD_URL=http://host.docker.internal:7860 docker compose -f tetramaster/art/docker-compose.art.yml run --rm generator
```

## Running locally (no Docker)

From the **repository root** (requires a running SD API, e.g. the Docker SD container or a local install):

```bash
# 1. Generate prompts
node tetramaster/art/scripts/generate-prompts.mjs

# 2. Generate images (SD_URL default http://localhost:7860)
node tetramaster/art/scripts/generate-images.mjs
```

Or both: `node tetramaster/art/scripts/run-all.mjs`

## Outputs

- **Prompts:** `tetramaster/art/prompts/prompts.json` – 100 entries with `id`, `name`, `prompt`, `negativePrompt`, `seed`.
- **Images:** `tetramaster/art/output/001.png` … `tetramaster/art/output/100.png` (gitignored).

## Validation

- Prompt dataset: exactly 100 entries; one per card in `src/data/cards.json`.
- Seeds: deterministic from card ID; re-running prompt generation yields the same seeds.
- After image generation: 100 PNG files in `tetramaster/art/output/` with stable filenames `001.png`–`100.png`.

## Integration with the game

The game’s existing art pipeline can use these images by placing them in `public/generated/{id}.png` and using the appropriate art provider (e.g. `generated` or `local`). This art pipeline only produces the assets; it does not change game code.
