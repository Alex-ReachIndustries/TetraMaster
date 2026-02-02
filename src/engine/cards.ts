import type { CardDefinition, CardInstance, Direction } from './types'
import type { RngState } from './rng'
import { nextBool, nextInt } from './rng'
import { directionOrder } from './directions'

export type ArrowGenerationMode = 'density' | 'original'

export interface ArrowGenerationOptions {
  mode: ArrowGenerationMode
  density: number
}

const originalArrowProbability = [1, 8, 25, 31, 18, 9, 5, 2, 1]

const pickArrowCountOriginal = (rng: RngState): { count: number; rng: RngState } => {
  const [roll, nextRng] = nextInt(rng, 0, 99)
  let total = 0
  for (let i = 0; i < originalArrowProbability.length; i += 1) {
    total += originalArrowProbability[i]
    if (roll < total) {
      return { count: i, rng: nextRng }
    }
  }
  return { count: 0, rng: nextRng }
}

const pickRandomDirections = (
  count: number,
  rng: RngState,
): { arrows: Direction[]; rng: RngState } => {
  const order = [...directionOrder]
  let nextRng = rng
  for (let i = order.length - 1; i > 0; i -= 1) {
    const [index, updated] = nextInt(nextRng, 0, i)
    nextRng = updated
    const temp = order[i]
    order[i] = order[index]
    order[index] = temp
  }
  return { arrows: order.slice(0, count), rng: nextRng }
}

export const createCardInstance = (
  definition: CardDefinition,
  rng: RngState,
  options: ArrowGenerationOptions,
): { card: CardInstance; rng: RngState } => {
  let nextRng = rng
  let arrows: Direction[] = []
  if (options.mode === 'original') {
    const { count, rng: afterCount } = pickArrowCountOriginal(nextRng)
    const { arrows: picked, rng: afterPick } = pickRandomDirections(count, afterCount)
    arrows = picked
    nextRng = afterPick
  } else {
    directionOrder.forEach((dir) => {
      const [enabled, updated] = nextBool(nextRng, options.density)
      nextRng = updated
      if (enabled) {
        arrows.push(dir)
      }
    })
  }

  const [idValue, idRng] = nextInt(nextRng, 0, 999999)
  const instanceId = `${definition.id}-${idValue.toString().padStart(6, '0')}`

  return {
    card: {
      instanceId,
      definitionId: definition.id,
      name: definition.name,
      stats: definition.stats,
      arrows,
    },
    rng: idRng,
  }
}

export const rerollArrows = (
  card: CardInstance,
  rng: RngState,
  options: ArrowGenerationOptions,
): { card: CardInstance; rng: RngState } => {
  const result = createCardInstance(
    {
      id: card.definitionId,
      name: card.name,
      stats: card.stats,
    },
    rng,
    options,
  )
  return {
    card: {
      ...card,
      arrows: result.card.arrows,
    },
    rng: result.rng,
  }
}
