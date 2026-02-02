/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import type { BattleResult } from '../../engine/types'
import { CardView } from './CardView'

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const BattleModal = ({
  battle,
  onComplete,
}: {
  battle: BattleResult
  onComplete: () => void
}) => {
  const { attackerCard, defenderCard, roll, winner } = battle
  const [attackerHp, setAttackerHp] = useState(roll.attackerValue)
  const [defenderHp, setDefenderHp] = useState(roll.defenderValue)
  const [phase, setPhase] = useState<'intro' | 'animating' | 'result'>('intro')

  const attackerTarget = useMemo(() => roll.attackDiff, [roll.attackDiff])
  const defenderTarget = useMemo(() => roll.defenseDiff, [roll.defenseDiff])

  useEffect(() => {
    setAttackerHp(roll.attackerValue)
    setDefenderHp(roll.defenderValue)
    setPhase('intro')
    let frame = 0
    let timeout = window.setTimeout(() => {
      setPhase('animating')
      const start = performance.now()
      const duration = 700
      const startAttacker = roll.attackerValue
      const startDefender = roll.defenderValue
      const tick = (now: number) => {
        const progress = clamp((now - start) / duration, 0, 1)
        const nextAttacker = Math.round(
          startAttacker - (startAttacker - attackerTarget) * progress,
        )
        const nextDefender = Math.round(
          startDefender - (startDefender - defenderTarget) * progress,
        )
        setAttackerHp(nextAttacker)
        setDefenderHp(nextDefender)
        if (progress < 1) {
          frame = requestAnimationFrame(tick)
        } else {
          setPhase('result')
        }
      }
      frame = requestAnimationFrame(tick)
    }, 300)
    return () => {
      window.clearTimeout(timeout)
      cancelAnimationFrame(frame)
    }
  }, [attackerTarget, defenderTarget, roll.attackerValue, roll.defenderValue])

  useEffect(() => {
    if (phase !== 'result') return undefined
    const timeout = window.setTimeout(() => {
      onComplete()
    }, 1200)
    return () => window.clearTimeout(timeout)
  }, [phase, onComplete])

  const attackerPercent = clamp((attackerHp / roll.attackerValue) * 100, 0, 100)
  const defenderPercent = clamp((defenderHp / roll.defenderValue) * 100, 0, 100)

  return (
    <div className="battle-overlay" role="dialog" aria-modal="true">
      <div className="battle-modal">
        <h3>Card battle</h3>
        <div className="battle-modal__grid">
          <div className="battle-card">
            <div className="battle-card__label">Attacker</div>
            <CardView card={attackerCard} owner={battle.attackerPlayer} interactive={false} />
            <div className="hp">
              <div className="hp__bar">
                <div className="hp__fill" style={{ width: `${attackerPercent}%` }} />
              </div>
              <div className="hp__value">{attackerHp}</div>
            </div>
          </div>
          <div className="battle-card">
            <div className="battle-card__label">Defender</div>
            <CardView card={defenderCard} owner={battle.defenderPlayer} interactive={false} />
            <div className="hp">
              <div className="hp__bar">
                <div className="hp__fill" style={{ width: `${defenderPercent}%` }} />
              </div>
              <div className="hp__value">{defenderHp}</div>
            </div>
          </div>
        </div>
        {phase === 'result' ? (
          <div className="battle-modal__result">
            {winner === 'attacker' ? 'Attacker wins' : 'Defender wins'}
          </div>
        ) : (
          <div className="battle-modal__result">Resolving battle...</div>
        )}
        <div className="battle-modal__actions">
          <button className="button button--ghost" onClick={onComplete}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
