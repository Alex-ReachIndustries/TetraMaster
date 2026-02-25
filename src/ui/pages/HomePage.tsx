import { Link } from 'react-router-dom'

const HeroArt = () => (
  <svg viewBox="0 0 320 200" className="hero__art" aria-hidden="true">
    <defs>
      <linearGradient id="hero-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1a1a2e" />
        <stop offset="100%" stopColor="#0d0b14" />
      </linearGradient>
      <radialGradient id="hero-glow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#c8a96e" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#c8a96e" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="320" height="200" rx="12" fill="url(#hero-bg)" />
    <circle cx="160" cy="80" r="70" fill="url(#hero-glow)" />
    {/* Fan of cards */}
    <g transform="translate(160, 100)">
      <rect x="-50" y="-55" width="34" height="48" rx="4" fill="#1e1a2e" stroke="#3a2d50" strokeWidth="1" transform="rotate(-20)" opacity="0.7" />
      <rect x="-17" y="-60" width="34" height="48" rx="4" fill="#1e1a2e" stroke="#c8a96e" strokeWidth="1.5" />
      <rect x="16" y="-55" width="34" height="48" rx="4" fill="#1e1a2e" stroke="#3a2d50" strokeWidth="1" transform="rotate(20)" opacity="0.7" />
      <text y="-30" textAnchor="middle" fontSize="20">🃏</text>
    </g>
    {/* 4x4 grid hint */}
    <g transform="translate(100, 130)" opacity="0.15">
      {[0,1,2,3].map(r => [0,1,2,3].map(c => (
        <rect key={`${r}-${c}`} x={c*30} y={r*15} width="28" height="13" rx="2" fill="#c8a96e" stroke="#c8a96e" strokeWidth="0.3" />
      )))}
    </g>
    <text x="160" y="190" textAnchor="middle" fill="#c8a96e" fontSize="7" opacity="0.3" fontFamily="serif" letterSpacing="3">
      TETRA MASTER
    </text>
  </svg>
)

export const HomePage = () => (
  <section className="page">
    <div className="hero">
      <div>
        <p className="eyebrow">Final Fantasy IX — Card Game Recreation</p>
        <h1>Tetra Master</h1>
        <p className="lede">
          Build a five-card deck, place cards on a 4×4 board, and battle for control.
          Journey across 8 regions, defeat 40 opponents, and collect all 100 cards.
        </p>
        <div className="hero__actions">
          <Link className="button button--primary" to="/campaign">
            Journey Mode
          </Link>
          <Link className="button button--ghost" to="/play">
            Free Play
          </Link>
          <Link className="button button--ghost" to="/deck-builder">
            Deck Builder
          </Link>
        </div>
      </div>
      <div>
        <HeroArt />
        <div className="hero__card-grid">
          <div className="hero__tile">🗺️ 8 regions</div>
          <div className="hero__tile">⚔️ 40 opponents</div>
          <div className="hero__tile">🃏 100 cards</div>
          <div className="hero__tile">🏆 21 achievements</div>
        </div>
      </div>
    </div>
  </section>
)
