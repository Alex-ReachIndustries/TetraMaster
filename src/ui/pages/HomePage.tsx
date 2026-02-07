import { Link } from 'react-router-dom'

export const HomePage = () => (
  <section className="page">
    <div className="hero">
      <div>
        <p className="eyebrow">Classic-inspired browser card game</p>
        <h1>Tetra Master</h1>
        <p className="lede">
          Build a five-card deck, place cards on a 4&times;4 board, and battle for control using the
          original Tetra Master rules with all 100 cards.
        </p>
        <div className="hero__actions">
          <Link className="button button--primary" to="/play">
            Start a Match
          </Link>
          <Link className="button button--ghost" to="/deck-builder">
            Build a Deck
          </Link>
        </div>
      </div>
      <div className="hero__panel">
        <div className="hero__card-grid">
          <div className="hero__tile">4&times;4 Board</div>
          <div className="hero__tile">100 Cards</div>
          <div className="hero__tile">AI Opponents</div>
          <div className="hero__tile">Deck Builder</div>
        </div>
        <p className="hero__note">
          Deterministic rules engine, accessibility options, and a developer panel for debugging.
        </p>
      </div>
    </div>
  </section>
)
