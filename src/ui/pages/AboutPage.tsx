import { BattleDiagram } from '../components/BattleDiagram'

export const AboutPage = () => (
  <section className="page page--scroll">
    <h1>About Tetra Master</h1>

    <div className="about-grid">
      <div className="panel">
        <h2>How to Play</h2>
        <div className="about-rules">
          <div className="about-rule">
            <span className="about-rule__icon">🃏</span>
            <div>
              <strong>Build a Deck</strong>
              <p className="small">Choose 5 cards from your collection. Each card has power, a battle class, and defense stats.</p>
            </div>
          </div>
          <div className="about-rule">
            <span className="about-rule__icon">📍</span>
            <div>
              <strong>Place Cards</strong>
              <p className="small">Take turns placing cards on the 4×4 board. Arrows on your card point at adjacent cells.</p>
            </div>
          </div>
          <div className="about-rule">
            <span className="about-rule__icon">⚔️</span>
            <div>
              <strong>Capture &amp; Battle</strong>
              <p className="small">If your arrow points at an opponent&apos;s card without a matching arrow back, you capture it. Opposing arrows trigger a stat battle.</p>
            </div>
          </div>
          <div className="about-rule">
            <span className="about-rule__icon">🏆</span>
            <div>
              <strong>Win</strong>
              <p className="small">Control more cards than your opponent when all 10 cards are placed.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Game Modes</h2>
        <div className="about-rules">
          <div className="about-rule">
            <span className="about-rule__icon">🗺️</span>
            <div>
              <strong>Journey Mode</strong>
              <p className="small">Travel across 8 regions, defeat 40 opponents, collect cards, earn achievements. Each opponent has normal and hard difficulties with separate rewards.</p>
            </div>
          </div>
          <div className="about-rule">
            <span className="about-rule__icon">🎮</span>
            <div>
              <strong>Free Play</strong>
              <p className="small">Quick matches against AI or a local opponent. Choose any deck, any difficulty, any settings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="panel">
      <h2>Battle System Reference</h2>
      <BattleDiagram />
    </div>

    <div className="panel">
      <h2>Sources &amp; Credits</h2>
      <div className="about-links">
        <a href="https://finalfantasy.fandom.com/wiki/Tetra_Master_(minigame)" target="_blank" rel="noreferrer">
          Rules reference — Final Fantasy Wiki
        </a>
        <a href="https://finalfantasy.fandom.com/wiki/Final_Fantasy_IX_Tetra_Master_cards" target="_blank" rel="noreferrer">
          Card list — Final Fantasy Wiki
        </a>
        <a href="https://github.com/Albeoris/Memoria" target="_blank" rel="noreferrer">
          Arrow generation — Memoria project
        </a>
      </div>
      <p className="small" style={{ marginTop: '0.5rem' }}>
        Fan-made recreation. Not affiliated with Square Enix. Built with React, TypeScript, and Vite.
      </p>
    </div>
  </section>
)
