import { describe, it, expect } from 'vitest'
import { createGame, applyMove, getLegalMoves, countScores } from '../../src/engine/rules'
import { createRng, nextInt } from '../../src/engine/rng'
import type { CardInstance, GameState, PlayerId } from '../../src/engine/types'

const strongHand: CardInstance[] = [
  { instanceId: 's1', definitionId: '023', name: 'Antlion', stats: { power: '3', class: 'P', physical: '2', magical: '1' }, arrows: ['N', 'E', 'S'] },
  { instanceId: 's2', definitionId: '028', name: 'Ralvuimago', stats: { power: '3', class: 'P', physical: '4', magical: '0' }, arrows: ['N', 'SE', 'W'] },
  { instanceId: 's3', definitionId: '030', name: 'Troll', stats: { power: '3', class: 'P', physical: '3', magical: '2' }, arrows: ['NE', 'S', 'W'] },
  { instanceId: 's4', definitionId: '031', name: 'Blazer', stats: { power: '4', class: 'P', physical: '5', magical: '1' }, arrows: ['N', 'E', 'SW'] },
  { instanceId: 's5', definitionId: '036', name: 'Dragon', stats: { power: '4', class: 'P', physical: '4', magical: '4' }, arrows: ['NE', 'S', 'W', 'NW'] },
]

const weakHand: CardInstance[] = [
  { instanceId: 'w1', definitionId: '001', name: 'Goblin', stats: { power: '0', class: 'P', physical: '0', magical: '0' }, arrows: ['SE'] },
  { instanceId: 'w2', definitionId: '002', name: 'Fang', stats: { power: '0', class: 'P', physical: '0', magical: '0' }, arrows: ['W', 'E'] },
  { instanceId: 'w3', definitionId: '003', name: 'Skeleton', stats: { power: '0', class: 'P', physical: '0', magical: '0' }, arrows: ['N'] },
  { instanceId: 'w4', definitionId: '005', name: 'Zaghnol', stats: { power: '0', class: 'P', physical: '0', magical: '0' }, arrows: ['S', 'NW'] },
  { instanceId: 'w5', definitionId: '089', name: 'Chocobo', stats: { power: '0', class: 'P', physical: '0', magical: '0' }, arrows: ['SW'] },
]

function simulateRandomGame(seed: string): { winner: PlayerId | 'draw'; scores: Record<PlayerId, number> } {
  let game = createGame({
    playerNames: ['Strong', 'Weak'],
    playerHands: [strongHand, weakHand],
    seed,
    blockedCount: 0,
    useRandomBlocks: false,
  })

  while (game.status === 'in_progress') {
    const moves = getLegalMoves(game)
    if (moves.length === 0) break
    const idx = Math.abs(hashStr(seed + game.turn)) % moves.length
    game = applyMove(game, moves[idx])
  }

  const scores = countScores(game)
  const winner: PlayerId | 'draw' =
    scores[0] > scores[1] ? 0 : scores[1] > scores[0] ? 1 : 'draw'
  return { winner, scores }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return h
}

describe('campaign battle balance', () => {
  it('power 3 vs defense 0 battle should heavily favour the attacker', () => {
    let attackerWins = 0
    for (let i = 0; i < 500; i++) {
      let rng = createRng(`battle-${i}`)
      // power '3' → statRange → { min: 48, max: 63 }
      // physical '0' → statRange → { min: 0, max: 15 }
      const [attackerValue, rng1] = nextInt(rng, 48, 63)
      const [defenderValue, rng2] = nextInt(rng1, 0, 15)
      const [attackRoll, rng3] = nextInt(rng2, 0, attackerValue)
      const [defenseRoll] = nextInt(rng3, 0, defenderValue)
      if (attackerValue - attackRoll > defenderValue - defenseRoll) attackerWins++
    }
    // With power 3 vs 0 defense, attacker should win >85% of battles
    expect(attackerWins).toBeGreaterThan(425)
  })

  it('strong deck should beat weak deck most of the time with random placement', () => {
    let strongWins = 0
    const total = 50
    for (let i = 0; i < total; i++) {
      const { winner } = simulateRandomGame(`sim-${i}`)
      if (winner === 0) strongWins++
    }
    // Strong deck should win at least 60% even with random placement
    expect(strongWins).toBeGreaterThanOrEqual(30)
  })

  it('game should always reach finished status with all cards placed', () => {
    for (let i = 0; i < 20; i++) {
      let game = createGame({
        playerNames: ['A', 'B'],
        playerHands: [strongHand, weakHand],
        seed: `complete-${i}`,
        blockedCount: 0,
        useRandomBlocks: false,
      })
      let turns = 0
      while (game.status === 'in_progress') {
        const moves = getLegalMoves(game)
        if (moves.length === 0) break
        game = applyMove(game, moves[0])
        turns++
        if (turns > 20) break
      }
      expect(game.status).toBe('finished')
      expect(turns).toBe(10)
    }
  })

  it('captures and battles produce correct events', () => {
    let game = createGame({
      playerNames: ['Strong', 'Weak'],
      playerHands: [strongHand, weakHand],
      seed: 'events-check',
      blockedCount: 0,
      useRandomBlocks: false,
    })

    // Play through one full game and check events are sensible
    while (game.status === 'in_progress') {
      const moves = getLegalMoves(game)
      if (moves.length === 0) break
      game = applyMove(game, moves[0])
    }

    const placeEvents = game.events.filter((e) => e.type === 'place')
    const endEvents = game.events.filter((e) => e.type === 'end')

    expect(placeEvents.length).toBe(10) // 5 cards per player
    expect(endEvents.length).toBe(1)

    const endEvent = endEvents[0]
    if (endEvent.type === 'end') {
      const scores = endEvent.scores
      expect(scores[0] + scores[1]).toBe(10) // all cards accounted for
    }
  })
})
