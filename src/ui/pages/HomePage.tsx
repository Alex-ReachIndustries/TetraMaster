import { Link } from 'react-router-dom'

export const HomePage = () => (
  <section className="page">
    <div className="hero">
      <div>
        <p className="eyebrow">Classic-inspired browser card game</p>
        <h1>Play Tetra Master in the browser</h1>
        <p className="lede">
          Build a five-card deck, place cards on a 4x4 board, and battle for control with the
          original Tetra Master rules and all 100 cards.
        </p>
        <div className="hero__actions">
          <Link className="button button--primary" to="/play">
            Start a match
          </Link>
          <Link className="button button--ghost" to="/deck-builder">
            Build a deck
          </Link>
        </div>
      </div>
      <div className="hero__panel">
        <div className="hero__card-grid">
          <div className="hero__tile">4x4 board</div>
          <div className="hero__tile">100 cards</div>
          <div className="hero__tile">AI opponents</div>
          <div className="hero__tile">Deck builder</div>
        </div>
        <p className="hero__note">
          Designed with deterministic rules, accessibility options, and a dev panel for debugging.
        </p>
      </div>
    </div>
  </section>
)
