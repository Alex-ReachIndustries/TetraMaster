import { describe, expect, it } from 'vitest'
import { cards } from '../../src/data/cards'

describe('card data', () => {
  it('contains exactly 100 cards', () => {
    expect(cards).toHaveLength(100)
  })

  it('has unique ids', () => {
    const ids = new Set(cards.map((card) => card.id))
    expect(ids.size).toBe(100)
  })
})
