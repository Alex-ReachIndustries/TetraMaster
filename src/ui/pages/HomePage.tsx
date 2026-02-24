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
          <Link className="button button--primary" to="/campaign">
            Journey Mode
          </Link>
          <Link className="button button--ghost" to="/play">
            Free Play
          </Link>
          <Link className="button button--ghost" to="/deck-builder">
            Build a deck
          </Link>
        </div>
      </div>
      <div className="hero__panel">
        <div className="hero__card-grid">
          <div className="hero__tile">Single-player campaign</div>
          <div className="hero__tile">100 cards to collect</div>
          <div className="hero__tile">15 opponents across 5 regions</div>
          <div className="hero__tile">Challenges &amp; bosses</div>
        </div>
        <p className="hero__note">
          Journey Mode: start with a basic deck, defeat opponents, and build your collection
          as you travel across the world.
        </p>
      </div>
    </div>
  </section>
)
