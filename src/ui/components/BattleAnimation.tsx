import clsx from 'clsx'
import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { BattleRoll, CardInstance, PlayerId } from '../../engine/types'
import {
  BATTLE_BUMP_MS,
  BATTLE_HOLD_MS,
  BATTLE_POPIN_MS,
  BATTLE_REDUCED_HOLD_MS,
  BATTLE_WINNER_MS,
  getBattleTickMs,
} from '../animationConfig'
import { CardView } from './CardView'

export type BattlePresentation = {
  attacker: CardInstance
  defender: CardInstance
  attackerPlayer: PlayerId
  defenderPlayer: PlayerId
  roll: BattleRoll
  winner: 'attacker' | 'defender'
}

type BattlePhase = 'enter' | 'bump' | 'tick' | 'result'

export const BattleAnimation = ({
  battle,
  reducedMotion,
  onComplete,
}: {
  battle: BattlePresentation
  reducedMotion: boolean
  onComplete: () => void
}) => {
  const [phase, setPhase] = useState<BattlePhase>('enter')
  const [leftHealth, setLeftHealth] = useState(battle.roll.attackerValue)
  const [rightHealth, setRightHealth] = useState(battle.roll.defenderValue)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    dialogRef.current?.focus()
  }, [battle])

  useEffect(() => {
    let cancelled = false
    const timers: number[] = []

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(resolve, ms)
        timers.push(id)
      })

    const runTick = () =>
      new Promise<void>((resolve) => {
        const startLeft = battle.roll.attackerValue
        const startRight = battle.roll.defenderValue
        const endLeft = battle.roll.attackDiff
        const endRight = battle.roll.defenseDiff
        const attackDamage = Math.max(0, startLeft - endLeft)
        const defenseDamage = Math.max(0, startRight - endRight)
        const duration = getBattleTickMs(attackDamage, defenseDamage)
        const startTime = performance.now()

        const step = (now: number) => {
          if (cancelled) return
          const progress = Math.min(1, (now - startTime) / duration)
          setLeftHealth(Math.round(startLeft - attackDamage * progress))
          setRightHealth(Math.round(startRight - defenseDamage * progress))
          if (progress < 1) {
            rafRef.current = window.requestAnimationFrame(step)
          } else {
            resolve()
          }
        }

        rafRef.current = window.requestAnimationFrame(step)
      })

    const run = async () => {
      setPhase('enter')
      setLeftHealth(battle.roll.attackerValue)
      setRightHealth(battle.roll.defenderValue)

      if (reducedMotion) {
        setLeftHealth(battle.roll.attackDiff)
        setRightHealth(battle.roll.defenseDiff)
        setPhase('result')
        await wait(BATTLE_REDUCED_HOLD_MS)
        if (!cancelled) onComplete()
        return
      }

      await wait(BATTLE_POPIN_MS)
      if (cancelled) return
      setPhase('bump')

      await wait(BATTLE_BUMP_MS)
      if (cancelled) return
      setPhase('tick')

      await runTick()
      if (cancelled) return
      setPhase('result')

      await wait(BATTLE_HOLD_MS)
      if (!cancelled) onComplete()
    }

    run()

    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [battle, reducedMotion, onComplete])

  const winnerSide = battle.winner === 'attacker' ? 'left' : 'right'
  const contentClassName = clsx('battle-modal__content', `battle-modal__content--${phase}`)
  const leftClassName = clsx(
    'battle-card',
    'battle-card--left',
    phase === 'bump' && 'battle-card--bump',
    phase === 'result' && winnerSide === 'left' && 'battle-card--winner',
    phase === 'result' && winnerSide === 'right' && 'battle-card--loser',
  )
  const rightClassName = clsx(
    'battle-card',
    'battle-card--right',
    phase === 'bump' && 'battle-card--bump',
    phase === 'result' && winnerSide === 'right' && 'battle-card--winner',
    phase === 'result' && winnerSide === 'left' && 'battle-card--loser',
  )

  const styleVars: CSSProperties = {
    '--battle-popin-ms': `${BATTLE_POPIN_MS}ms`,
    '--battle-bump-ms': `${BATTLE_BUMP_MS}ms`,
    '--battle-winner-ms': `${BATTLE_WINNER_MS}ms`,
  }

  return (
    <div className="battle-modal" style={styleVars} role="presentation">
      <div className="battle-modal__backdrop" />
      <div
        className={contentClassName}
        role="dialog"
        aria-modal="true"
        aria-label="Battle resolution"
        tabIndex={-1}
        ref={dialogRef}
        onKeyDown={(event) => {
          if (event.key === 'Tab') {
            event.preventDefault()
          }
        }}
      >
        <div className="battle-modal__title">Battle!</div>
        <div className="battle-modal__arena">
          <div className={leftClassName} data-owner={battle.attackerPlayer}>
            <div className="battle-card__health">{leftHealth}</div>
            <CardView card={battle.attacker} owner={battle.attackerPlayer} size="large" interactive={false} />
            <div className="battle-card__label">Attacker</div>
          </div>
          <div className={rightClassName} data-owner={battle.defenderPlayer}>
            <div className="battle-card__health">{rightHealth}</div>
            <CardView
              card={battle.defender}
              owner={battle.defenderPlayer}
              size="large"
              interactive={false}
            />
            <div className="battle-card__label">Defender</div>
          </div>
        </div>
        {phase === 'result' ? (
          <div className="battle-modal__result">
            {winnerSide === 'left' ? 'Attacker wins!' : 'Defender wins!'}
          </div>
        ) : (
          <div className="battle-modal__result battle-modal__result--muted">Resolving...</div>
        )}
      </div>
    </div>
  )
}
