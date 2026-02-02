import type { GameState, Move, PlayerId } from '../engine/types'
import { applyMove, getLegalMoves } from '../engine/rules'
import { evaluateState } from './evaluate'
import { createRng, nextInt, type RngState } from '../engine/rng'

export interface AiConfig {
  timeBudgetMs: number
  randomness: boolean
  rngSeed: string
}

const sortMoves = (moves: Move[]): Move[] =>
  [...moves].sort((a, b) => {
    if (a.cardInstanceId !== b.cardInstanceId) {
      return a.cardInstanceId.localeCompare(b.cardInstanceId)
    }
    if (a.position.y !== b.position.y) {
      return a.position.y - b.position.y
    }
    return a.position.x - b.position.x
  })

const chooseWithTieBreak = (
  candidates: { move: Move; score: number }[],
  rng: RngState,
  randomness: boolean,
): { move: Move; rng: RngState } => {
  const bestScore = Math.max(...candidates.map((candidate) => candidate.score))
  const bestMoves = candidates.filter((candidate) => candidate.score === bestScore)
  if (!randomness || bestMoves.length === 1) {
    return { move: bestMoves[0].move, rng }
  }
  const [index, nextRng] = nextInt(rng, 0, bestMoves.length - 1)
  return { move: bestMoves[index].move, rng: nextRng }
}

const nowMs = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now())

const alphaBeta = (
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  playerId: PlayerId,
  startTime: number,
  timeBudgetMs: number,
): number => {
  if (depth === 0 || state.status === 'finished') {
    return evaluateState(state, playerId)
  }
  const now = nowMs()
  if (now - startTime >= timeBudgetMs) {
    return evaluateState(state, playerId)
  }
  const moves = sortMoves(getLegalMoves(state, state.activePlayer))
  if (moves.length === 0) {
    return evaluateState(state, playerId)
  }

  const maximizing = state.activePlayer === playerId
  let bestValue = maximizing ? -Infinity : Infinity

  for (const move of moves) {
    const nextState = applyMove(state, move)
    const value = alphaBeta(
      nextState,
      depth - 1,
      alpha,
      beta,
      playerId,
      startTime,
      timeBudgetMs,
    )
    if (maximizing) {
      bestValue = Math.max(bestValue, value)
      alpha = Math.max(alpha, bestValue)
      if (beta <= alpha) break
    } else {
      bestValue = Math.min(bestValue, value)
      beta = Math.min(beta, bestValue)
      if (beta <= alpha) break
    }
  }
  return bestValue
}

const searchBestMove = (
  state: GameState,
  playerId: PlayerId,
  depth: number,
  config: AiConfig,
): Move | null => {
  const moves = sortMoves(getLegalMoves(state, playerId))
  if (moves.length === 0) return null
  const start = nowMs()
  const scored = moves.map((move) => ({
    move,
    score: alphaBeta(
      applyMove(state, move),
      depth - 1,
      -Infinity,
      Infinity,
      playerId,
      start,
      config.timeBudgetMs,
    ),
  }))
  const rng = createRng(config.rngSeed)
  return chooseWithTieBreak(scored, rng, config.randomness).move
}

export const selectMoveEasy = (state: GameState, playerId: PlayerId, config: AiConfig): Move => {
  const moves = sortMoves(getLegalMoves(state, playerId))
  const scored = moves.map((move) => ({
    move,
    score: evaluateState(applyMove(state, move), playerId),
  }))
  const rng = createRng(config.rngSeed)
  return chooseWithTieBreak(scored, rng, config.randomness).move
}

export const selectMoveMedium = (state: GameState, playerId: PlayerId, config: AiConfig): Move => {
  const move = searchBestMove(state, playerId, 2, config)
  return move ?? selectMoveEasy(state, playerId, config)
}

export const selectMoveHard = (state: GameState, playerId: PlayerId, config: AiConfig): Move => {
  const start = nowMs()
  let bestMove: Move | null = null
  let depth = 2
  while (nowMs() - start < config.timeBudgetMs && depth <= 4) {
    const candidate = searchBestMove(state, playerId, depth, config)
    if (candidate) {
      bestMove = candidate
    }
    depth += 1
  }
  return bestMove ?? selectMoveMedium(state, playerId, config)
}
