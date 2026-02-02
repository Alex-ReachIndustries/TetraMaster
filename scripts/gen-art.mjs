import fs from 'node:fs/promises'
import path from 'node:path'

const endpoint =
  process.env.LOCAL_ART_ENDPOINT ||
  process.env.VITE_LOCAL_ART_ENDPOINT ||
  'http://localhost:8081/card'
const outputDir = process.env.ART_OUTPUT_DIR || path.join(process.cwd(), 'public', 'generated')
const cardsPath = path.join(process.cwd(), 'src', 'data', 'cards.json')

const readJson = async (filePath) => {
  const raw = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(raw)
}

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true })
}

const dataUrlToBuffer = (dataUrl) => {
  const [header, base64] = dataUrl.split(',')
  const match = header.match(/data:(image\/[a-zA-Z0-9+.-]+);base64/)
  const mime = match ? match[1] : 'image/png'
  const ext = mime.split('/')[1] || 'png'
  return { buffer: Buffer.from(base64, 'base64'), ext }
}

const fetchImageBuffer = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

const requestArt = async (payload) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Art endpoint error: ${response.status}`)
  }
  return response.json()
}

const run = async () => {
  await ensureDir(outputDir)
  const cards = await readJson(cardsPath)
  console.log(`Generating ${cards.length} card images via ${endpoint}`)

  for (const card of cards) {
    const payload = { id: card.id, name: card.name, seed: card.id }
    try {
      const data = await requestArt(payload)
      if (data.dataUrl) {
        const { buffer, ext } = dataUrlToBuffer(data.dataUrl)
        const outPath = path.join(outputDir, `${card.id}.${ext}`)
        await fs.writeFile(outPath, buffer)
        console.log(`Saved ${outPath}`)
      } else if (data.imageUrl) {
        const buffer = await fetchImageBuffer(data.imageUrl)
        const outPath = path.join(outputDir, `${card.id}.png`)
        await fs.writeFile(outPath, buffer)
        console.log(`Saved ${outPath}`)
      } else {
        console.warn(`No image returned for ${card.id}`)
      }
    } catch (error) {
      console.warn(`Failed for ${card.id}: ${error.message}`)
    }
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
