## Summary

Adds a **TetraMaster-specific, Dockerized card art generation pipeline** with **local image generation** (no API key). Adapted from the [Story_Teller](https://github.com) Dixit-clone card art generator: same local Stable Diffusion WebUI (A1111) in Docker, no auth; logic is TetraMaster-specific.

## Local image generation (Story_Teller integration)

- **Stable Diffusion** runs in Docker (`ghcr.io/ai-dock/stable-diffusion-webui`), same pattern as Story_Teller’s `tools/cardset-studio`: API on port 7860, `WEB_ENABLE_AUTH=false`, no API key.
- **Generator** service `depends_on: stable-diffusion` with healthcheck; one command starts SD (if needed), waits for healthy, then runs prompt + image generation.
- **Volumes** for SD models and outputs (named volumes; optional bind mount for custom models – see `MODELS.md`).
- **`MODELS.md`** explains how to use built-in defaults or mount a model (e.g. from Civitai); no API key required.

## How to run local Docker generation

From the **repository root** (one command; no API key):

```bash
docker compose -f tetramaster/art/docker-compose.art.yml run --rm generator
```

This starts the Stable Diffusion container (first run may pull a large image and load a model), waits for it to be healthy, then generates prompts and all 100 images into `tetramaster/art/output/`.

Optional: use an SD instance on the host:

```powershell
$env:SD_URL = "http://host.docker.internal:7860"
docker compose -f tetramaster/art/docker-compose.art.yml run --rm generator
```

See `tetramaster/art/README.md` and `tetramaster/art/MODELS.md` for details.

## Validation steps and expected outputs

1. **Prompt dataset** – `tetramaster/art/prompts/prompts.json`: 100 entries, deterministic seeds, no Dixit wording.
2. **Image generation** – With SD running (Docker or host), generator produces `001.png` … `100.png` and `manifest.json` in `tetramaster/art/output/`.
3. **Tests** – `npm run test` passes.
4. **No runtime dependency** on Story_Teller; only the integration pattern (local SD in Docker) is reused.
