export const AboutPage = () => (
  <section className="page">
    <h1>About this project</h1>
    <p>
      This fan-made project recreates Final Fantasy IX&apos;s Tetra Master minigame using original
      visuals and modern web tooling. It is not affiliated with Square Enix.
    </p>

    <h2>Sources &amp; citations</h2>
    <ul className="list">
      <li>
        Rules reference:{' '}
        <a
          href="https://finalfantasy.fandom.com/wiki/Tetra_Master_(minigame)"
          target="_blank"
          rel="noreferrer"
        >
          finalfantasy.fandom.com/wiki/Tetra_Master_(minigame)
        </a>
      </li>
      <li>
        Card list reference:{' '}
        <a
          href="https://finalfantasy.fandom.com/wiki/Final_Fantasy_IX_Tetra_Master_cards"
          target="_blank"
          rel="noreferrer"
        >
          finalfantasy.fandom.com/wiki/Final_Fantasy_IX_Tetra_Master_cards
        </a>
      </li>
      <li>
        Manual excerpts:{' '}
        <a
          href="https://finalfantasy.fandom.com/wiki/Final_Fantasy_IX/Manual/North_America"
          target="_blank"
          rel="noreferrer"
        >
          finalfantasy.fandom.com/wiki/Final_Fantasy_IX/Manual/North_America
        </a>
      </li>
    </ul>

    <h2>Implementation notes</h2>
    <ul className="list">
      <li>
        Card art is procedurally generated SVG by default. Optional local image generation is
        supported, but disabled unless configured.
      </li>
      <li>
        Arrow patterns are generated per card instance (as in-game cards can vary) and can be rerolled
        in the deck builder. The card list sources do not include fixed arrow layouts.
      </li>
      <li>
        Combat resolution follows the three-phase random roll process described in the rules
        reference (stat range roll, attack/defense roll, differential comparison).
      </li>
    </ul>
  </section>
)
