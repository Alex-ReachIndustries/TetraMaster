export type BattleClass = 'P' | 'M' | 'X' | 'A'
export type StatHex =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'

export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
export type PlayerId = 0 | 1

export interface CardStats {
  power: StatHex
  class: BattleClass
  physical: StatHex
  magical: StatHex
}

export interface CardDefinition {
  id: string
  name: string
  stats: CardStats
}

export interface CardInstance {
  instanceId: string
  definitionId: string
  name: string
  stats: CardStats
  arrows: Direction[]
}

export interface Position {
  x: number
  y: number
}

export type Cell =
  | { type: 'empty' }
  | { type: 'blocked' }
  | { type: 'card'; card: CardInstance; owner: PlayerId }

export interface PlayerState {
  id: PlayerId
  name: string
  hand: CardInstance[]
}

export interface BattleRoll {
  attackerValue: number
  defenderValue: number
  attackRoll: number
  defenseRoll: number
  attackDiff: number
  defenseDiff: number
}

export interface BattleResult {
  winner: 'attacker' | 'defender'
  roll: BattleRoll
  attackerPos: Position
  defenderPos: Position
  attackerPlayer: PlayerId
  defenderPlayer: PlayerId
}

export type CaptureReason = 'arrow' | 'battle' | 'combo'

export type GameEvent =
  | {
      type: 'place'
      playerId: PlayerId
      cardId: string
      position: Position
    }
  | {
      type: 'capture'
      playerId: PlayerId
      fromPlayerId: PlayerId
      position: Position
      reason: CaptureReason
    }
  | {
      type: 'battle'
      result: BattleResult
    }
  | {
      type: 'end'
      winner: PlayerId | 'draw'
      scores: Record<PlayerId, number>
    }

export interface GameState {
  width: number
  height: number
  board: Cell[][]
  players: PlayerState[]
  activePlayer: PlayerId
  rngState: number
  seed: string
  turn: number
  status: 'in_progress' | 'finished'
  winner?: PlayerId | 'draw'
  events: GameEvent[]
}

export interface Move {
  playerId: PlayerId
  cardInstanceId: string
  position: Position
  battleOrder?: Direction[]
}

export interface GameSetup {
  playerNames: [string, string]
  playerHands: [CardInstance[], CardInstance[]]
  seed: string
  blockedCount?: number
  useRandomBlocks: boolean
  battleOrder?: Direction[]
}
