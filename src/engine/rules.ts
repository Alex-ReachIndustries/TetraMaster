import type {
  BattleResult,
  CardInstance,
  Cell,
  GameEvent,
  GameSetup,
  GameState,
  Move,
  PlayerId,
  Position,
} from './types'
import { addPosition, defaultBattleOrder, directionVectors, oppositeDirection } from './directions'
import { createRng, nextInt, type RngState } from './rng'
import { maxHex, minHex, statRange } from './utils'

const createEmptyBoard = (width: number, height: number): Cell[][] =>
  Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ type: 'empty' as const })),
  )

const cloneCard = (card: CardInstance): CardInstance => ({
  ...card,
  stats: { ...card.stats },
  arrows: [...card.arrows],
})

const cloneBoard = (board: Cell[][]): Cell[][] =>
  board.map((row) =>
    row.map((cell) => {
      if (cell.type === 'card') {
        return {
          type: 'card' as const,
          owner: cell.owner,
          card: cloneCard(cell.card),
        }
      }
      if (cell.type === 'blocked') {
        return { type: 'blocked' as const }
      }
      return { type: 'empty' as const }
    }),
  )

const clonePlayers = (players: GameState['players']): GameState['players'] =>
  players.map((player) => ({
    ...player,
    hand: player.hand.map((card) => cloneCard(card)),
  }))

const isWithinBoard = (state: GameState, pos: Position): boolean =>
  pos.x >= 0 && pos.x < state.width && pos.y >= 0 && pos.y < state.height

const getCell = (state: GameState, pos: Position): Cell => state.board[pos.y][pos.x]

const setCell = (state: GameState, pos: Position, cell: Cell): void => {
  state.board[pos.y][pos.x] = cell
}

const togglePlayer = (playerId: PlayerId): PlayerId => (playerId === 0 ? 1 : 0)

const drawRandomPositions = (
  width: number,
  height: number,
  count: number,
  rng: RngState,
): { positions: Position[]; rng: RngState } => {
  const positions: Position[] = []
  const available: Position[] = []
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      available.push({ x, y })
    }
  }
  let nextRng = rng
  for (let i = 0; i < count && available.length > 0; i += 1) {
    const [index, updated] = nextInt(nextRng, 0, available.length - 1)
    nextRng = updated
    positions.push(available.splice(index, 1)[0])
  }
  return { positions, rng: nextRng }
}

export const createGame = (setup: GameSetup): GameState => {
  const width = 4
  const height = 4
  let rng = createRng(setup.seed)
  let blockedCount = setup.blockedCount ?? 0
  if (setup.useRandomBlocks) {
    const [count, updated] = nextInt(rng, 0, 6)
    blockedCount = count
    rng = updated
  }
  const { positions: blockedPositions, rng: rngAfterBlocks } = drawRandomPositions(
    width,
    height,
    blockedCount,
    rng,
  )
  rng = rngAfterBlocks
  const [coin, rngAfterCoin] = nextInt(rng, 0, 1)
  rng = rngAfterCoin

  const board = createEmptyBoard(width, height)
  blockedPositions.forEach((pos) => {
    board[pos.y][pos.x] = { type: 'blocked' }
  })

  return {
    width,
    height,
    board,
    players: [
      {
        id: 0,
        name: setup.playerNames[0],
        hand: setup.playerHands[0].map((card) => cloneCard(card)),
      },
      {
        id: 1,
        name: setup.playerNames[1],
        hand: setup.playerHands[1].map((card) => cloneCard(card)),
      },
    ],
    activePlayer: coin as PlayerId,
    rngState: rng.state,
    seed: setup.seed,
    turn: 1,
    status: 'in_progress',
    events: [],
  }
}

const pickBattleStats = (attacker: CardInstance, defender: CardInstance) => {
  const power = attacker.stats.power
  if (attacker.stats.class === 'P') {
    return { attacker: power, defender: defender.stats.physical }
  }
  if (attacker.stats.class === 'M') {
    return { attacker: power, defender: defender.stats.magical }
  }
  if (attacker.stats.class === 'X') {
    return { attacker: power, defender: minHex(defender.stats.physical, defender.stats.magical) }
  }
  return {
    attacker: maxHex(power, attacker.stats.physical, attacker.stats.magical),
    defender: minHex(defender.stats.power, defender.stats.physical, defender.stats.magical),
  }
}

const rollBattle = (
  attacker: CardInstance,
  defender: CardInstance,
  rng: RngState,
): { result: 'attacker' | 'defender'; roll: BattleResult['roll']; rng: RngState } => {
  const stats = pickBattleStats(attacker, defender)
  const attackerRange = statRange(stats.attacker)
  const defenderRange = statRange(stats.defender)

  let nextRng = rng
  const [attackerValue, rng1] = nextInt(nextRng, attackerRange.min, attackerRange.max)
  nextRng = rng1
  const [defenderValue, rng2] = nextInt(nextRng, defenderRange.min, defenderRange.max)
  nextRng = rng2
  const [attackRoll, rng3] = nextInt(nextRng, 0, attackerValue)
  nextRng = rng3
  const [defenseRoll, rng4] = nextInt(nextRng, 0, defenderValue)
  nextRng = rng4

  const attackDiff = attackerValue - attackRoll
  const defenseDiff = defenderValue - defenseRoll

  return {
    result: attackDiff > defenseDiff ? 'attacker' : 'defender',
    roll: {
      attackerValue,
      defenderValue,
      attackRoll,
      defenseRoll,
      attackDiff,
      defenseDiff,
    },
    rng: nextRng,
  }
}

const applyCombo = (
  state: GameState,
  sourcePos: Position,
  newOwner: PlayerId,
  events: GameEvent[],
): void => {
  const sourceCell = getCell(state, sourcePos)
  if (sourceCell.type !== 'card') return
  sourceCell.card.arrows.forEach((dir) => {
    const targetPos = addPosition(sourcePos, directionVectors[dir])
    if (!isWithinBoard(state, targetPos)) return
    const target = getCell(state, targetPos)
    if (target.type === 'card' && target.owner !== newOwner) {
      setCell(state, targetPos, {
        type: 'card',
        owner: newOwner,
        card: target.card,
      })
      events.push({
        type: 'capture',
        playerId: newOwner,
        fromPlayerId: target.owner,
        position: targetPos,
        reason: 'combo',
      })
    }
  })
}

const resolvePlacement = (
  state: GameState,
  playerId: PlayerId,
  card: CardInstance,
  position: Position,
  battleOrder?: Move['battleOrder'],
): GameEvent[] => {
  const events: GameEvent[] = []
  setCell(state, position, { type: 'card', owner: playerId, card })
  events.push({
    type: 'place',
    playerId,
    cardId: card.definitionId,
    position,
  })

  const directCaptures: Position[] = []
  const battles: { dir: string; pos: Position }[] = []
  card.arrows.forEach((dir) => {
    const targetPos = addPosition(position, directionVectors[dir])
    if (!isWithinBoard(state, targetPos)) return
    const targetCell = getCell(state, targetPos)
    if (targetCell.type !== 'card' || targetCell.owner === playerId) return
    const opposing = oppositeDirection[dir as keyof typeof oppositeDirection]
    const targetHasOpposing = targetCell.card.arrows.includes(opposing)
    if (targetHasOpposing) {
      battles.push({ dir, pos: targetPos })
    } else {
      directCaptures.push(targetPos)
    }
  })

  directCaptures.forEach((targetPos) => {
    const targetCell = getCell(state, targetPos)
    if (targetCell.type !== 'card' || targetCell.owner === playerId) return
    setCell(state, targetPos, {
      type: 'card',
      owner: playerId,
      card: targetCell.card,
    })
    events.push({
      type: 'capture',
      playerId,
      fromPlayerId: targetCell.owner,
      position: targetPos,
      reason: 'arrow',
    })
  })

  const order = battleOrder && battleOrder.length > 0 ? battleOrder : defaultBattleOrder
  const orderedBattles = order
    .map((dir) => battles.find((battle) => battle.dir === dir))
    .filter((value): value is { dir: string; pos: Position } => Boolean(value))
  const remainingBattles = battles.filter(
    (battle) =>
      !orderedBattles.some(
        (ordered) => ordered.pos.x === battle.pos.x && ordered.pos.y === battle.pos.y,
      ),
  )
  orderedBattles.push(...remainingBattles)

  for (const battle of orderedBattles) {
    const attackerCell = getCell(state, position)
    if (attackerCell.type !== 'card' || attackerCell.owner !== playerId) {
      break
    }
    const defenderCell = getCell(state, battle.pos)
    if (defenderCell.type !== 'card' || defenderCell.owner === playerId) {
      continue
    }
    const rng = { state: state.rngState }
    const { result, roll, rng: rngNext } = rollBattle(attackerCell.card, defenderCell.card, rng)
    state.rngState = rngNext.state
    const battleResult: BattleResult = {
      winner: result,
      roll,
      attackerPos: position,
      defenderPos: battle.pos,
      attackerPlayer: attackerCell.owner,
      defenderPlayer: defenderCell.owner,
    }
    events.push({ type: 'battle', result: battleResult })
    if (result === 'attacker') {
      setCell(state, battle.pos, {
        type: 'card',
        owner: attackerCell.owner,
        card: defenderCell.card,
      })
      events.push({
        type: 'capture',
        playerId: attackerCell.owner,
        fromPlayerId: defenderCell.owner,
        position: battle.pos,
        reason: 'battle',
      })
      applyCombo(state, battle.pos, attackerCell.owner, events)
    } else {
      setCell(state, position, {
        type: 'card',
        owner: defenderCell.owner,
        card: attackerCell.card,
      })
      events.push({
        type: 'capture',
        playerId: defenderCell.owner,
        fromPlayerId: attackerCell.owner,
        position,
        reason: 'battle',
      })
      applyCombo(state, position, defenderCell.owner, events)
      break
    }
  }

  return events
}

export const getLegalMoves = (state: GameState, playerId = state.activePlayer): Move[] => {
  if (state.status !== 'in_progress') return []
  const player = state.players[playerId]
  const emptyPositions: Position[] = []
  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const cell = state.board[y][x]
      if (cell.type === 'empty') {
        emptyPositions.push({ x, y })
      }
    }
  }
  return player.hand.flatMap((card) =>
    emptyPositions.map((position) => ({
      playerId,
      cardInstanceId: card.instanceId,
      position,
    })),
  )
}

export const countScores = (state: GameState): Record<PlayerId, number> => {
  const scores: Record<PlayerId, number> = { 0: 0, 1: 0 }
  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const cell = state.board[y][x]
      if (cell.type === 'card') {
        scores[cell.owner] += 1
      }
    }
  }
  return scores
}

export const isGameOver = (state: GameState): boolean =>
  state.players.every((player) => player.hand.length === 0)

export const applyMove = (state: GameState, move: Move): GameState => {
  if (state.status !== 'in_progress') {
    return state
  }
  if (move.playerId !== state.activePlayer) {
    return state
  }
  const nextState: GameState = {
    ...state,
    board: cloneBoard(state.board),
    players: clonePlayers(state.players),
    events: [...state.events],
  }
  const player = nextState.players[move.playerId]
  const cardIndex = player.hand.findIndex((card) => card.instanceId === move.cardInstanceId)
  if (cardIndex < 0) {
    return state
  }
  if (!isWithinBoard(nextState, move.position)) {
    return state
  }
  const targetCell = getCell(nextState, move.position)
  if (targetCell.type !== 'empty') {
    return state
  }

  const [card] = player.hand.splice(cardIndex, 1)
  const events = resolvePlacement(nextState, move.playerId, card, move.position, move.battleOrder)
  nextState.events.push(...events)

  if (isGameOver(nextState)) {
    nextState.status = 'finished'
    const scores = countScores(nextState)
    let winner: PlayerId | 'draw' = 'draw'
    if (scores[0] !== scores[1]) {
      winner = scores[0] > scores[1] ? 0 : 1
    }
    nextState.winner = winner
    nextState.events.push({
      type: 'end',
      winner,
      scores,
    })
  } else {
    nextState.activePlayer = togglePlayer(nextState.activePlayer)
    nextState.turn += 1
  }

  return nextState
}

export const getCardCount = (state: GameState, playerId: PlayerId): number => {
  const scores = countScores(state)
  return scores[playerId]
}

export const getRemainingSlots = (state: GameState): number => {
  let empty = 0
  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      if (state.board[y][x].type === 'empty') empty += 1
    }
  }
  return empty
}

