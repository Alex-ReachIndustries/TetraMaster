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
          <div className="hero__tile">
            <span className="hero__tile-value">4&times;4</span>
            <span className="hero__tile-label">Board</span>
          </div>
          <div className="hero__tile">
            <span className="hero__tile-value">100</span>
            <span className="hero__tile-label">Cards</span>
          </div>
          <div className="hero__tile">
            <span className="hero__tile-value">3</span>
            <span className="hero__tile-label">AI Levels</span>
          </div>
          <div className="hero__tile">
            <span className="hero__tile-value">8</span>
            <span className="hero__tile-label">Directions</span>
          </div>
        </div>
        <p className="hero__note">
          Features deterministic rules, accessibility options, and a dev panel for debugging.
        </p>
      </div>
    </div>
  </section>
)
