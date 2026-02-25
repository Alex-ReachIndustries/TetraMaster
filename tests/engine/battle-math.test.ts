import { describe, it, expect } from 'vitest'
import { createRng, nextInt } from '../../src/engine/rng'
import { statRange, hexToInt } from '../../src/engine/utils'
import type { StatHex } from '../../src/engine/types'

function simulateBattle(
  attackStat: StatHex,
  defendStat: StatHex,
  trials: number,
  dampening: number = 1.0,
): { attackerWins: number; defenderWins: number; rate: number } {
  let attackerWins = 0
  let defenderWins = 0

  const aRange = statRange(attackStat)
  const dRange = statRange(defendStat)

  for (let i = 0; i < trials; i++) {
    let rng = createRng(`battle-math-${i}`)
    const [aVal, r1] = nextInt(rng, aRange.min, aRange.max)
    const [dVal, r2] = nextInt(r1, dRange.min, dRange.max)
    const aRollMax = Math.max(0, Math.floor(aVal * dampening))
    const dRollMax = Math.max(0, Math.floor(dVal * dampening))
    const [aRoll, r3] = nextInt(r2, 0, aRollMax)
    const [dRoll] = nextInt(r3, 0, dRollMax)
    const aDiff = aVal - aRoll
    const dDiff = dVal - dRoll
    if (aDiff > dDiff) attackerWins++
    else defenderWins++
  }

  return { attackerWins, defenderWins, rate: attackerWins / trials }
}

describe('battle math analysis', () => {
  const trials = 2000

  it('current system (dampening=1.0): stat ranges are correct', () => {
    expect(statRange('0')).toEqual({ min: 0, max: 15 })
    expect(statRange('3')).toEqual({ min: 48, max: 63 })
    expect(statRange('8')).toEqual({ min: 128, max: 143 })
    expect(statRange('F')).toEqual({ min: 240, max: 255 })
  })

  it('current system: large gap (3 vs 0) attacker should win >80%', () => {
    const result = simulateBattle('3', '0', trials)
    expect(result.rate).toBeGreaterThan(0.8)
  })

  it('current system: 1-hex gap (3 vs 2) should favour attacker', () => {
    const result = simulateBattle('3', '2', trials)
    expect(result.rate).toBeGreaterThan(0.55)
  })

  it('current system: equal stats (3 vs 3) should be ~50/50', () => {
    const result = simulateBattle('3', '3', trials)
    expect(result.rate).toBeGreaterThan(0.4)
    expect(result.rate).toBeLessThan(0.6)
  })

  it('tuned (dampening=0.5): large gap much more decisive', () => {
    const result = simulateBattle('3', '0', trials, 0.5)
    expect(result.rate).toBeGreaterThan(0.95)
  })

  it('tuned (dampening=0.5): 1-hex gap more decisive', () => {
    const result = simulateBattle('3', '2', trials, 0.5)
    expect(result.rate).toBeGreaterThan(0.65)
  })

  it('tuned (dampening=0.5): equal stats still ~50/50', () => {
    const result = simulateBattle('3', '3', trials, 0.5)
    expect(result.rate).toBeGreaterThan(0.4)
    expect(result.rate).toBeLessThan(0.6)
  })

  it('print win rate table for reference', () => {
    const stats: StatHex[] = ['0', '1', '2', '3', '4', '5', '8', 'C', 'F']
    const results: string[] = ['Win rates (attack stat vs defense stat, dampening=0.5):']

    for (const a of ['0', '2', '4', '8'] as StatHex[]) {
      for (const d of ['0', '2', '4', '8'] as StatHex[]) {
        const r = simulateBattle(a, d, 1000, 0.5)
        results.push(`  ${a} vs ${d}: ${(r.rate * 100).toFixed(1)}%`)
      }
    }
    console.log(results.join('\n'))
    expect(true).toBe(true)
  })
})
