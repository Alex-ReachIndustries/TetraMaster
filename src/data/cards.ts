import cardsData from './cards.json'
import type { CardDefinition } from '../engine/types'

export const cards = cardsData as CardDefinition[]

export const cardById = (id: string): CardDefinition | undefined =>
  cards.find((card) => card.id === id)
