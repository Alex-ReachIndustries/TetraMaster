import { useEffect, useState } from 'react'
import type { GameState } from '../../engine/types'
import { CardView } from './CardView'

const StoneBlock = () => (
  <svg viewBox="0 0 40 40" className="stone-block" aria-label="Blocked">
    <rect x="2" y="4" width="36" height="32" rx="3" fill="#2a2520" stroke="#3d352c" strokeWidth="1" />
    <rect x="4" y="6" width="15" height="10" rx="1.5" fill="#332d26" stroke="#4a4035" strokeWidth="0.5" />
    <rect x="21" y="6" width="15" height="10" rx="1.5" fill="#30291f" stroke="#4a4035" strokeWidth="0.5" />
    <rect x="3" y="18" width="12" height="10" rx="1.5" fill="#30291f" stroke="#4a4035" strokeWidth="0.5" />
    <rect x="17" y="18" width="10" height="10" rx="1.5" fill="#352e25" stroke="#4a4035" strokeWidth="0.5" />
    <rect x="29" y="18" width="8" height="10" rx="1.5" fill="#2e2820" stroke="#4a4035" strokeWidth="0.5" />
    <rect x="5" y="30" width="14" height="6" rx="1" fill="#332d26" stroke="#4a4035" strokeWidth="0.5" />
    <rect x="21" y="30" width="15" height="6" rx="1" fill="#30291f" stroke="#4a4035" strokeWidth="0.5" />
    <line x1="4" y1="17" x2="36" y2="17" stroke="#1a1510" strokeWidth="0.5" />
    <line x1="4" y1="29" x2="36" y2="29" stroke="#1a1510" strokeWidth="0.5" />
    <line x1="19" y1="6" x2="19" y2="17" stroke="#1a1510" strokeWidth="0.5" />
    <line x1="15" y1="18" x2="15" y2="29" stroke="#1a1510" strokeWidth="0.5" />
    <line x1="27" y1="18" x2="27" y2="29" stroke="#1a1510" strokeWidth="0.5" />
  </svg>
)

export const BoardView = ({
  game,
  onCellClick,
  flashByPosition,
  interactionDisabled = false,
  animateBlocks = false,
}: {
  game: GameState
  onCellClick: (x: number, y: number) => void
  flashByPosition?: Record<string, 'place' | 'capture'>
  interactionDisabled?: boolean
  animateBlocks?: boolean
}) => {
  const [revealedBlocks, setRevealedBlocks] = useState<Set<string>>(new Set())
  const [animDone, setAnimDone] = useState(!animateBlocks)

  useEffect(() => {
    if (!animateBlocks || animDone) return
    const blocked: string[] = []
    game.board.forEach((row, y) =>
      row.forEach((cell, x) => {
        if (cell.type === 'blocked') blocked.push(`${x},${y}`)
      }),
    )
    if (blocked.length === 0) { setAnimDone(true); return }

    const timers: number[] = []
    blocked.forEach((key, i) => {
      timers.push(window.setTimeout(() => {
        setRevealedBlocks((prev) => new Set([...prev, key]))
      }, 200 + i * 250))
    })
    timers.push(window.setTimeout(() => setAnimDone(true), 200 + blocked.length * 250 + 200))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [animateBlocks, animDone, game.board])

  return (
    <div className="board">
      {game.board.map((row, y) =>
        row.map((cell, x) => {
          const key = `${x},${y}`
          const isClickable = !interactionDisabled && cell.type === 'empty'
          const flash = flashByPosition?.[key]
          const blockVisible = !animateBlocks || animDone || revealedBlocks.has(key)

          return (
            <button
              key={`cell-${key}`}
              type="button"
              className={`board-cell ${cell.type === 'blocked' ? (blockVisible ? 'board-cell--blocked' : 'board-cell--empty') : `board-cell--${cell.type}`}`}
              onClick={() => isClickable && onCellClick(x, y)}
              disabled={!isClickable}
            >
              {cell.type === 'card' ? (
                <CardView card={cell.card} owner={cell.owner} size="small" interactive={false} flash={flash} />
              ) : null}
              {cell.type === 'blocked' && blockVisible ? (
                <div className={`stone-block-wrapper ${animateBlocks && revealedBlocks.has(key) && !animDone ? 'stone-block--animate' : ''}`}>
                  <StoneBlock />
                </div>
              ) : null}
            </button>
          )
        }),
      )}
    </div>
  )
}
