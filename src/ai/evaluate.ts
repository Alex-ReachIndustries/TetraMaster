import type { GameState, PlayerId } from '../engine/types'
import { countScores } from '../engine/rules'
import { hexToInt } from '../engine/utils'

const sumStatStrength = (state: GameState, playerId: PlayerId): number => {
  let sum = 0
  state.board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.type === 'card' && cell.owner === playerId) {
        sum +=
          hexToInt(cell.card.stats.power) +
          hexToInt(cell.card.stats.physical) +
          hexToInt(cell.card.stats.magical)
      }
    })
  })
  state.players[playerId].hand.forEach((card) => {
    sum +=
      hexToInt(card.stats.power) +
      hexToInt(card.stats.physical) +
      hexToInt(card.stats.magical)
  })
  return sum
}

export const evaluateState = (state: GameState, playerId: PlayerId): number => {
  const scores = countScores(state)
  const opponent: PlayerId = playerId === 0 ? 1 : 0
  const scoreDiff = scores[playerId] - scores[opponent]
  const handDiff = state.players[playerId].hand.length - state.players[opponent].hand.length
  const statDiff = sumStatStrength(state, playerId) - sumStatStrength(state, opponent)

  return scoreDiff * 100 + handDiff * 5 + statDiff * 0.2
}
