import type { CardDefinition, CardInstance, Direction } from './types'
import type { RngState } from './rng'
import { nextBool, nextInt } from './rng'
import { directionOrder } from './directions'

export interface ArrowGenerationOptions {
  density: number
}

export const createCardInstance = (
  definition: CardDefinition,
  rng: RngState,
  options: ArrowGenerationOptions,
): { card: CardInstance; rng: RngState } => {
  const arrows: Direction[] = []
  let nextRng = rng
  directionOrder.forEach((dir) => {
    const [enabled, updated] = nextBool(nextRng, options.density)
    nextRng = updated
    if (enabled) {
      arrows.push(dir)
    }
  })

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
