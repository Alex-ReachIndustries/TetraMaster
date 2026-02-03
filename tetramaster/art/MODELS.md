# Stable Diffusion models for TetraMaster art

Local image generation uses [Stable Diffusion WebUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) in Docker (no API key). This file explains how to get a model so the pipeline can generate the 100 card images.

## Option 1: Use the image’s default models

The `ghcr.io/ai-dock/stable-diffusion-webui` image may provision default SDXL models on first run. If so, you can start the stack and run the generator without extra steps:

```bash
docker compose -f tetramaster/art/docker-compose.art.yml run --rm generator
```

If the API reports no model or generation fails, use Option 2.

## Option 2: Mount a model directory (recommended)

1. Download a model file (e.g. from [Civitai](https://civitai.com)):
   - **SDXL (recommended):** e.g. Juggernaut XL, DreamShaper XL, or Deliberate XL (`.safetensors`, ~6.5 GB).
   - **SD 1.5:** smaller and faster on low VRAM; use 512×768 or similar in the generator script if needed.

2. Create a local directory and put the model there:
   ```bash
   mkdir -p tetramaster/art/sd-models
   # Place your .safetensors file in tetramaster/art/sd-models/
   ```

3. Override the compose volume so the container uses your folder. From repo root, run with an override or edit `docker-compose.art.yml` so the `stable-diffusion` service has:
   ```yaml
   volumes:
     - ./tetramaster/art/sd-models:/opt/stable-diffusion-webui/models/Stable-diffusion
     - sd_outputs:/opt/stable-diffusion-webui/outputs
   ```

4. Start and run:
   ```bash
   docker compose -f tetramaster/art/docker-compose.art.yml run --rm generator
   ```

## Verifying the API and model

With the stack running (or after starting `stable-diffusion`):

```bash
curl -s http://localhost:7860/sdapi/v1/sd-models | head -50
```

You should see at least one model. The pipeline uses whatever model is currently loaded (default or first in list if none is explicitly set).

## Hardware

- **GPU:** NVIDIA GPU with 8GB+ VRAM recommended for SDXL; 6GB can work with SD 1.5 or lower resolution.
- **RAM:** 16GB+ system RAM.
- **Disk:** ~20GB for one SDXL model plus outputs.

## No API key

Everything runs locally in Docker; no OpenAI, Civitai, or other API keys are required unless you use the WebUI to pull gated models (then you can set `HF_TOKEN` / `CIVITAI_TOKEN` in the `stable-diffusion` service environment).
