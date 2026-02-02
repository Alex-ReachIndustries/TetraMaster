import type { Direction, Position } from './types'

export const directionOrder: Direction[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

export const defaultBattleOrder: Direction[] = ['N', 'E', 'S', 'W', 'NE', 'SE', 'SW', 'NW']

export const directionVectors: Record<Direction, Position> = {
  N: { x: 0, y: -1 },
  NE: { x: 1, y: -1 },
  E: { x: 1, y: 0 },
  SE: { x: 1, y: 1 },
  S: { x: 0, y: 1 },
  SW: { x: -1, y: 1 },
  W: { x: -1, y: 0 },
  NW: { x: -1, y: -1 },
}

export const oppositeDirection: Record<Direction, Direction> = {
  N: 'S',
  NE: 'SW',
  E: 'W',
  SE: 'NW',
  S: 'N',
  SW: 'NE',
  W: 'E',
  NW: 'SE',
}

export const arrowsToMask = (arrows: Direction[]): string => {
  const set = new Set(arrows)
  return directionOrder.map((dir) => (set.has(dir) ? '1' : '0')).join('')
}

export const maskToArrows = (mask: string): Direction[] => {
  const trimmed = mask.trim()
  const values =
    trimmed.length >= directionOrder.length ? trimmed.slice(0, directionOrder.length) : trimmed
  return directionOrder.filter((_, index) => values[index] === '1')
}

export const addPosition = (pos: Position, delta: Position): Position => ({
  x: pos.x + delta.x,
  y: pos.y + delta.y,
})
