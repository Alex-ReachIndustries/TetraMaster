# TetraMaster art pipeline: prompt generation + image generation (Stable Diffusion API)
FROM node:20-slim

WORKDIR /app

# Scripts run from repo root; expect repo to be mounted at /app
# No COPY of app code – run with: docker compose run --rm -v .:/app generator
RUN apt-get update -qq && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV SD_URL=http://stable-diffusion:7860

# Default: run full pipeline (prompts then images)
CMD ["sh", "-c", "node tetramaster/art/scripts/generate-prompts.mjs && node tetramaster/art/scripts/generate-images.mjs"]
