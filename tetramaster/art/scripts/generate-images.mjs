/**
 * TetraMaster card art – batch image generation via Stable Diffusion (A1111) API
 * Reads prompts from tetramaster/art/prompts/prompts.json and writes PNGs to output/.
 * Pipeline adapted from a Dixit-clone card art generator; no runtime dependency on that project.
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const SD_URL = process.env.SD_URL || process.env.STABLE_DIFFUSION_URL || 'http://localhost:7860'
const PROMPTS_PATH = path.join(process.cwd(), 'tetramaster', 'art', 'prompts', 'prompts.json')
const OUTPUT_DIR = path.join(process.cwd(), 'tetramaster', 'art', 'output')

const DEFAULT_STEPS = 30
const DEFAULT_CFG = 7.5
const WIDTH = 768
const HEIGHT = 1152
const SAMPLER = 'DPM++ 2M Karras'

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function txt2img(prompt, negativePrompt, seed) {
  const body = {
    prompt,
    negative_prompt: negativePrompt,
    steps: DEFAULT_STEPS,
    cfg_scale: DEFAULT_CFG,
    width: WIDTH,
    height: HEIGHT,
    sampler_name: SAMPLER,
    seed: seed >= 0 ? seed : Math.floor(Math.random() * 2147483647),
    batch_size: 1,
    n_iter: 1,
    save_images: false,
    send_images: true,
  }
  const res = await fetch(`${SD_URL.replace(/\/$/, '')}/sdapi/v1/txt2img`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SD API ${res.status}: ${text}`)
  }
  const data = await res.json()
  if (!data.images || data.images.length === 0) throw new Error('No image in response')
  return Buffer.from(data.images[0], 'base64')
}

async function main() {
  const raw = await fs.readFile(PROMPTS_PATH, 'utf-8')
  const prompts = JSON.parse(raw)
  if (!Array.isArray(prompts) || prompts.length !== 100) {
    throw new Error(`Expected 100 entries in ${PROMPTS_PATH}, got ${prompts?.length ?? 0}`)
  }

  await ensureDir(OUTPUT_DIR)

  let ok = 0
  let fail = 0
  for (let i = 0; i < prompts.length; i++) {
    const { id, name, prompt, negativePrompt, seed } = prompts[i]
    const outPath = path.join(OUTPUT_DIR, `${id}.png`)
    try {
      const png = await txt2img(prompt, negativePrompt, seed)
      await fs.writeFile(outPath, png)
      console.log(`[${i + 1}/${prompts.length}] ${id} ${name} -> ${outPath}`)
      ok++
    } catch (err) {
      console.error(`[${i + 1}/${prompts.length}] ${id} FAILED: ${err.message}`)
      fail++
    }
  }
  const manifest = {
    generatedAt: new Date().toISOString(),
    total: prompts.length,
    success: ok,
    failed: fail,
    files: prompts.map((p) => `${p.id}.png`),
  }
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json')
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
  console.log(`Wrote ${manifestPath}`)
  console.log(`Done: ${ok} generated, ${fail} failed`)
  if (fail > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
