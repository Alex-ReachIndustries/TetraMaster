import type { CardInstance } from './types'

export interface DeckValidationOptions {
  size: number
  allowDuplicates: boolean
}

export interface DeckValidationResult {
  valid: boolean
  errors: string[]
}

export const validateDeck = (
  deck: CardInstance[],
  options: DeckValidationOptions,
): DeckValidationResult => {
  const errors: string[] = []
  if (deck.length !== options.size) {
    errors.push(`Deck must contain exactly ${options.size} cards.`)
  }
  if (!options.allowDuplicates) {
    const seen = new Set<string>()
    deck.forEach((card) => {
      if (seen.has(card.definitionId)) {
        errors.push(`Duplicate card: ${card.name}.`)
      }
      seen.add(card.definitionId)
    })
  }
  return {
    valid: errors.length === 0,
    errors,
  }
}
