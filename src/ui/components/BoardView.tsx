import type { GameState } from '../../engine/types'
import { CardView } from './CardView'

export const BoardView = ({
  game,
  onCellClick,
  flashByPosition,
  interactionDisabled = false,
}: {
  game: GameState
  onCellClick: (x: number, y: number) => void
  flashByPosition?: Record<string, 'place' | 'capture'>
  interactionDisabled?: boolean
}) => (
  <div className="board-frame">
    <div className="board">
      {game.board.map((row, y) =>
        row.map((cell, x) => {
          const isClickable = !interactionDisabled && cell.type === 'empty'
          const flash = flashByPosition?.[`${x},${y}`]
          return (
            <button
              key={`cell-${x}-${y}`}
              type="button"
              className={`board-cell board-cell--${cell.type}`}
              onClick={() => isClickable && onCellClick(x, y)}
              disabled={!isClickable}
            >
              {cell.type === 'card' ? (
                <CardView
                  card={cell.card}
                  owner={cell.owner}
                  size="small"
                  interactive={false}
                  flash={flash}
                />
              ) : null}
              {cell.type === 'blocked' ? <span className="board-cell__blocked">X</span> : null}
            </button>
          )
        }),
      )}
    </div>
  </div>
)
