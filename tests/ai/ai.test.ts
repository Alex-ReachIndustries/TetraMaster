import { describe, expect, it } from 'vitest'
import type { CardInstance, CardStats, Direction } from '../../src/engine/types'
import { createGame, getLegalMoves } from '../../src/engine/rules'
import { selectMoveEasy } from '../../src/ai'

const makeCard = (
  id: string,
  stats: CardStats,
  arrows: Direction[],
  instanceId = `${id}-test`,
): CardInstance => ({
  instanceId,
  definitionId: id,
  name: id,
  stats,
  arrows,
})

describe('AI', () => {
  it('selects a legal move on easy', () => {
    const attacker = makeCard('A', { power: '5', class: 'P', physical: '2', magical: '1' }, ['E'])
    const opponent = makeCard('B', { power: '4', class: 'M', physical: '1', magical: '2' }, ['W'])
    const state = createGame({
      playerNames: ['P1', 'P2'],
      playerHands: [[attacker], [opponent]],
      seed: 'ai-seed',
      useRandomBlocks: false,
      blockedCount: 0,
    })
    state.activePlayer = 0
    const move = selectMoveEasy(state, 0, {
      timeBudgetMs: 100,
      randomness: false,
      rngSeed: 'ai-seed',
    })
    const legalMoves = getLegalMoves(state, 0)
    const isLegal = legalMoves.some(
      (candidate) =>
        candidate.cardInstanceId === move.cardInstanceId &&
        candidate.position.x === move.position.x &&
        candidate.position.y === move.position.y,
    )
    expect(isLegal).toBe(true)
  })
})
