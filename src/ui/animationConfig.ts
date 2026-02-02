import type { PlayerId } from '../engine/types'

export const AI_PLAY_DELAY_MIN_MS = 500
export const AI_PLAY_DELAY_MAX_MS = 850
export const AI_PLAY_DELAY_REDUCED_MS = 150

export const PLACE_FLASH_MS = 220
export const CAPTURE_FLASH_MS = 260

export const BATTLE_POPIN_MS = 160
export const BATTLE_BUMP_MS = 320
export const BATTLE_TICK_MIN_MS = 500
export const BATTLE_TICK_MAX_MS = 900
export const BATTLE_TICK_DAMAGE_SCALE = 200
export const BATTLE_WINNER_MS = 200
export const BATTLE_HOLD_MS = 1000
export const BATTLE_REDUCED_HOLD_MS = 300

const hashString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export const getAiDelayMs = (
  seed: string,
  turn: number,
  playerId: PlayerId,
  reducedMotion: boolean,
) => {
  if (reducedMotion) return AI_PLAY_DELAY_REDUCED_MS
  const range = Math.max(0, AI_PLAY_DELAY_MAX_MS - AI_PLAY_DELAY_MIN_MS)
  if (range === 0) return AI_PLAY_DELAY_MIN_MS
  const hash = hashString(`${seed}-${turn}-${playerId}`)
  return AI_PLAY_DELAY_MIN_MS + (hash % (range + 1))
}

export const getBattleTickMs = (attackDamage: number, defenseDamage: number) => {
  const totalDamage = Math.max(0, attackDamage + defenseDamage)
  const normalized = Math.min(1, totalDamage / BATTLE_TICK_DAMAGE_SCALE)
  return Math.round(BATTLE_TICK_MIN_MS + (BATTLE_TICK_MAX_MS - BATTLE_TICK_MIN_MS) * normalized)
}
