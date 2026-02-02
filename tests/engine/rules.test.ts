import { describe, expect, it } from 'vitest'
import type { CardInstance, CardStats, Direction } from '../../src/engine/types'
import { applyMove, createGame } from '../../src/engine/rules'
import { nextInt } from '../../src/engine/rng'
import { statRange } from '../../src/engine/utils'

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

const computeBattleWinner = (
  attacker: CardInstance,
  defender: CardInstance,
  rngState: number,
): { winner: 'attacker' | 'defender'; nextState: number } => {
  const attackerRange = statRange(attacker.stats.power)
  const defenderRange = statRange(defender.stats.physical)
  let rng = { state: rngState }
  const [attackerValue, rng1] = nextInt(rng, attackerRange.min, attackerRange.max)
  rng = rng1
  const [defenderValue, rng2] = nextInt(rng, defenderRange.min, defenderRange.max)
  rng = rng2
  const [attackRoll, rng3] = nextInt(rng, 0, attackerValue)
  rng = rng3
  const [defenseRoll, rng4] = nextInt(rng, 0, defenderValue)
  rng = rng4
  const attackDiff = attackerValue - attackRoll
  const defenseDiff = defenderValue - defenseRoll
  return { winner: attackDiff > defenseDiff ? 'attacker' : 'defender', nextState: rng.state }
}

describe('rules engine', () => {
  it('resolves battles deterministically with seeded RNG', () => {
    const attacker = makeCard('A', { power: 'F', class: 'P', physical: '0', magical: '0' }, ['E'])
    const defender = makeCard('D', { power: '0', class: 'P', physical: '0', magical: '0' }, ['W'])
    const state = createGame({
      playerNames: ['P1', 'P2'],
      playerHands: [[attacker], []],
      seed: 'battle-seed',
      useRandomBlocks: false,
      blockedCount: 0,
    })
    state.activePlayer = 0
    state.board[0][1] = { type: 'card', owner: 1, card: defender }
    const expected = computeBattleWinner(attacker, defender, state.rngState)
    const nextState = applyMove(state, {
      playerId: 0,
      cardInstanceId: attacker.instanceId,
      position: { x: 0, y: 0 },
    })
    if (expected.winner === 'attacker') {
      const cell = nextState.board[0][1]
      expect(cell.type).toBe('card')
      expect(cell.type === 'card' && cell.owner).toBe(0)
    } else {
      const cell = nextState.board[0][0]
      expect(cell.type).toBe('card')
      expect(cell.type === 'card' && cell.owner).toBe(1)
    }
    expect(nextState.rngState).toBe(expected.nextState)
  })

  it('captures directly when arrows do not face back', () => {
    const attacker = makeCard('A', { power: '1', class: 'P', physical: '0', magical: '0' }, ['E'])
    const defender = makeCard('D', { power: '1', class: 'P', physical: '0', magical: '0' }, [])
    const state = createGame({
      playerNames: ['P1', 'P2'],
      playerHands: [[attacker], []],
      seed: 'capture-seed',
      useRandomBlocks: false,
      blockedCount: 0,
    })
    state.activePlayer = 0
    state.board[0][1] = { type: 'card', owner: 1, card: defender }
    const nextState = applyMove(state, {
      playerId: 0,
      cardInstanceId: attacker.instanceId,
      position: { x: 0, y: 0 },
    })
    const cell = nextState.board[0][1]
    expect(cell.type).toBe('card')
    expect(cell.type === 'card' && cell.owner).toBe(0)
  })

  it('applies combo flips after a battle win', () => {
    const attacker = makeCard('A', { power: 'F', class: 'P', physical: '0', magical: '0' }, ['E'])
    const defender = makeCard('D', { power: '0', class: 'P', physical: '0', magical: '0' }, ['W', 'S'])
    const comboTarget = makeCard('C', { power: '0', class: 'P', physical: '0', magical: '0' }, [])
    const state = createGame({
      playerNames: ['P1', 'P2'],
      playerHands: [[attacker], []],
      seed: 'combo-seed',
      useRandomBlocks: false,
      blockedCount: 0,
    })
    state.activePlayer = 0
    state.board[0][1] = { type: 'card', owner: 1, card: defender }
    state.board[1][1] = { type: 'card', owner: 1, card: comboTarget }
    const nextState = applyMove(state, {
      playerId: 0,
      cardInstanceId: attacker.instanceId,
      position: { x: 0, y: 0 },
    })
    const comboCell = nextState.board[1][1]
    expect(comboCell.type).toBe('card')
    expect(comboCell.type === 'card' && comboCell.owner).toBe(0)
  })

  it('ends the game when both hands are empty', () => {
    const cardA = makeCard('A', { power: '1', class: 'P', physical: '0', magical: '0' }, [])
    const cardB = makeCard('B', { power: '1', class: 'P', physical: '0', magical: '0' }, [])
    const state = createGame({
      playerNames: ['P1', 'P2'],
      playerHands: [[cardA], [cardB]],
      seed: 'end-seed',
      useRandomBlocks: false,
      blockedCount: 0,
    })
    state.activePlayer = 0
    const state1 = applyMove(state, {
      playerId: 0,
      cardInstanceId: cardA.instanceId,
      position: { x: 0, y: 0 },
    })
    const state2 = applyMove(state1, {
      playerId: 1,
      cardInstanceId: cardB.instanceId,
      position: { x: 1, y: 0 },
    })
    expect(state2.status).toBe('finished')
    expect(state2.winner).toBe('draw')
  })
})
