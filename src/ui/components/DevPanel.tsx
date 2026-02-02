import type { GameState } from '../../engine/types'

export const DevPanel = ({ game }: { game: GameState }) => (
  <aside className="dev-panel">
    <h3>Dev panel</h3>
    <div className="dev-panel__grid">
      <div>
        <strong>Seed</strong>
        <div>{game.seed}</div>
      </div>
      <div>
        <strong>RNG state</strong>
        <div>{game.rngState}</div>
      </div>
    </div>
    <details>
      <summary>Move history</summary>
      <pre>{JSON.stringify(game.events.slice(-12), null, 2)}</pre>
    </details>
    <details>
      <summary>Full game state</summary>
      <pre>{JSON.stringify(game, null, 2)}</pre>
    </details>
  </aside>
)
