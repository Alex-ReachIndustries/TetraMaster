/**
 * TetraMaster card art – prompt generator
 * Reads card definitions and writes one deterministic prompt per card.
 * Pipeline adapted from a Dixit-clone card art generator; logic is TetraMaster-specific.
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const CARDS_PATH = path.join(process.cwd(), 'src', 'data', 'cards.json')
const PROMPTS_PATH = path.join(process.cwd(), 'tetramaster', 'art', 'prompts', 'prompts.json')

const STYLE_SUFFIX =
  'dramatic lighting, clean composition, fantasy card illustration, detailed, professional, no text, no borders, no watermark'

const NEGATIVE_PROMPT = [
  'bad anatomy',
  'bad proportions',
  'deformed',
  'disconnected limbs',
  'extra limbs',
  'extra fingers',
  'mutated',
  'poorly drawn hands',
  'poorly drawn face',
  'worst quality',
  'low quality',
  'lowres',
  'blurry',
  'text',
  'watermark',
  'logo',
  'signature',
  'username',
  'jpeg artifacts',
  'cropped',
  'out of frame',
  'duplicate',
  'ugly',
  'nsfw',
].join(', ')

const CLASS_DESCRIPTORS = {
  P: 'physical creature, sturdy, fantasy monster or warrior',
  M: 'magical being, mystical, spellcaster or spirit',
  X: 'flexible fighter, mixed combat style, fantasy character',
  A: 'assault-type creature, aggressive, striking pose',
}

function deterministicSeed(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0
  }
  return Math.abs(h) % 2147483647
}

function buildPrompt(card) {
  const { id, name, stats } = card
  const classDesc = CLASS_DESCRIPTORS[stats.class] || 'fantasy creature'
  const subject = `${name}, ${classDesc}`
  const full = `Fantasy card art, ${subject}, ${STYLE_SUFFIX}`
  return full
}

async function main() {
  const cardsJson = await fs.readFile(CARDS_PATH, 'utf-8')
  const cards = JSON.parse(cardsJson)
  if (!Array.isArray(cards) || cards.length !== 100) {
    throw new Error(`Expected 100 cards in ${CARDS_PATH}, got ${cards?.length ?? 0}`)
  }

  const prompts = cards.map((card) => ({
    id: card.id,
    name: card.name,
    prompt: buildPrompt(card),
    negativePrompt: NEGATIVE_PROMPT,
    seed: deterministicSeed(card.id),
  }))

  const outDir = path.dirname(PROMPTS_PATH)
  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(PROMPTS_PATH, JSON.stringify(prompts, null, 2), 'utf-8')
  console.log(`Wrote ${prompts.length} prompts to ${PROMPTS_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
