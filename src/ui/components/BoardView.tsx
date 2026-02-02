import type { GameState } from '../../engine/types'
import { CardView } from './CardView'

export const BoardView = ({
  game,
  onCellClick,
}: {
  game: GameState
  onCellClick: (x: number, y: number) => void
}) => (
  <div className="board">
    {game.board.map((row, y) =>
      row.map((cell, x) => {
        const isClickable = cell.type === 'empty'
        return (
          <button
            key={`cell-${x}-${y}`}
            type="button"
            className={`board-cell board-cell--${cell.type}`}
            onClick={() => isClickable && onCellClick(x, y)}
            disabled={!isClickable}
          >
            {cell.type === 'card' ? (
              <CardView card={cell.card} owner={cell.owner} size="small" interactive={false} />
            ) : null}
            {cell.type === 'blocked' ? <span className="board-cell__blocked">X</span> : null}
          </button>
        )
      }),
    )}
  </div>
)
