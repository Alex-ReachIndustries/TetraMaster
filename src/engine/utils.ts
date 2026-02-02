import type { StatHex } from './types'

export const hexToInt = (value: StatHex): number => parseInt(value, 16)

export const statRange = (value: StatHex): { min: number; max: number } => {
  const base = hexToInt(value) * 16
  return { min: base, max: base + 15 }
}

export const maxHex = (...values: StatHex[]): StatHex => {
  return values.reduce((max, current) => (hexToInt(current) > hexToInt(max) ? current : max))
}

export const minHex = (...values: StatHex[]): StatHex => {
  return values.reduce((min, current) => (hexToInt(current) < hexToInt(min) ? current : min))
}
