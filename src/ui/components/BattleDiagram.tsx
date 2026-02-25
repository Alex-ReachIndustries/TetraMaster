export const BattleDiagram = () => (
  <svg viewBox="0 0 800 520" width="100%" style={{ maxWidth: 800, display: 'block' }}>
    <defs>
      <linearGradient id="bd-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a1a2e" />
        <stop offset="100%" stopColor="#0d0b14" />
      </linearGradient>
    </defs>

    <rect width="800" height="520" rx="12" fill="url(#bd-bg)" />

    {/* Title */}
    <text x="400" y="32" textAnchor="middle" fill="#f5cf85" fontSize="16" fontWeight="bold">
      Battle Resolution — How Card Stats Work
    </text>

    {/* Card stat layout */}
    <rect x="40" y="55" width="220" height="200" rx="10" fill="#1e1a2e" stroke="#3a2d50" strokeWidth="1" />
    <text x="150" y="78" textAnchor="middle" fill="#c8a96e" fontSize="13" fontWeight="bold">Card Stats Layout</text>

    <rect x="70" y="95" width="50" height="28" rx="4" fill="#151222" stroke="#4a3d60" />
    <text x="95" y="114" textAnchor="middle" fill="#7dd3fc" fontSize="12" fontWeight="bold">3</text>
    <text x="180" y="114" fill="#a89880" fontSize="10">← Power (attack strength)</text>

    <rect x="130" y="95" width="50" height="28" rx="4" fill="#151222" stroke="#4a3d60" />
    <text x="155" y="114" textAnchor="middle" fill="#f5cf85" fontSize="12" fontWeight="bold">P</text>
    <text x="180" y="134" fill="#a89880" fontSize="10">← Battle Class</text>

    <rect x="70" y="140" width="50" height="28" rx="4" fill="#151222" stroke="#4a3d60" />
    <text x="95" y="159" textAnchor="middle" fill="#4ade80" fontSize="12" fontWeight="bold">2</text>
    <text x="180" y="159" fill="#a89880" fontSize="10">← Physical Defense</text>

    <rect x="130" y="140" width="50" height="28" rx="4" fill="#151222" stroke="#4a3d60" />
    <text x="155" y="159" textAnchor="middle" fill="#a78bfa" fontSize="12" fontWeight="bold">1</text>
    <text x="180" y="179" fill="#a89880" fontSize="10">← Magical Defense</text>

    <text x="150" y="210" textAnchor="middle" fill="#666" fontSize="9">Values: 0-9, A-F (hex, 0=weakest, F=strongest)</text>
    <text x="150" y="225" textAnchor="middle" fill="#666" fontSize="9">Each hex digit = 16 levels of power</text>

    {/* Battle class explanations */}
    <rect x="290" y="55" width="470" height="200" rx="10" fill="#1e1a2e" stroke="#3a2d50" strokeWidth="1" />
    <text x="525" y="78" textAnchor="middle" fill="#c8a96e" fontSize="13" fontWeight="bold">Battle Classes — What Stat Fights What</text>

    {[
      { cls: 'P', name: 'Physical', color: '#f5cf85', desc: 'Attacker Power  vs  Defender Physical Def', y: 100 },
      { cls: 'M', name: 'Magical', color: '#a78bfa', desc: 'Attacker Power  vs  Defender Magical Def', y: 130 },
      { cls: 'X', name: 'Flexible', color: '#38bdf8', desc: 'Attacker Power  vs  Defender\'s LOWER defense', y: 160 },
      { cls: 'A', name: 'Assault', color: '#f87171', desc: 'Attacker\'s BEST stat  vs  Defender\'s WORST stat', y: 190 },
    ].map((item) => (
      <g key={item.cls}>
        <rect x="310" y={item.y - 14} width="28" height="22" rx="4" fill="#151222" stroke={item.color} />
        <text x="324" y={item.y + 1} textAnchor="middle" fill={item.color} fontSize="13" fontWeight="bold">{item.cls}</text>
        <text x="350" y={item.y + 1} fill="#e8dcc8" fontSize="11" fontWeight="600">{item.name}</text>
        <text x="440" y={item.y + 1} fill="#a89880" fontSize="10">{item.desc}</text>
      </g>
    ))}

    <text x="525" y="230" textAnchor="middle" fill="#666" fontSize="9">
      Class determines which stats are compared when two cards battle
    </text>

    {/* Battle resolution flow */}
    <rect x="40" y="270" width="720" height="230" rx="10" fill="#1e1a2e" stroke="#3a2d50" strokeWidth="1" />
    <text x="400" y="293" textAnchor="middle" fill="#c8a96e" fontSize="13" fontWeight="bold">
      Battle Resolution — 3 Phases
    </text>

    {/* Phase 1 */}
    <rect x="60" y="310" width="200" height="80" rx="8" fill="#151222" stroke="#4a3d60" />
    <text x="160" y="330" textAnchor="middle" fill="#f5cf85" fontSize="11" fontWeight="bold">Phase 1: Stat Roll</text>
    <text x="160" y="350" textAnchor="middle" fill="#a89880" fontSize="9">Pick random value in stat range</text>
    <text x="160" y="365" textAnchor="middle" fill="#7dd3fc" fontSize="9">Hex 3 → range [48..63]</text>
    <text x="160" y="380" textAnchor="middle" fill="#7dd3fc" fontSize="9">Roll: e.g. attackVal = 55</text>

    <path d="M 265 350 L 290 350" stroke="#c8a96e" strokeWidth="2" markerEnd="url(#arrowhead)" />

    {/* Phase 2 */}
    <rect x="295" y="310" width="200" height="80" rx="8" fill="#151222" stroke="#4a3d60" />
    <text x="395" y="330" textAnchor="middle" fill="#f5cf85" fontSize="11" fontWeight="bold">Phase 2: Damage Roll</text>
    <text x="395" y="350" textAnchor="middle" fill="#a89880" fontSize="9">Roll reduction from 0 to 50% of value</text>
    <text x="395" y="365" textAnchor="middle" fill="#7dd3fc" fontSize="9">dmgRoll = random [0..27]</text>
    <text x="395" y="380" textAnchor="middle" fill="#7dd3fc" fontSize="9">result = 55 - 12 = 43</text>

    <path d="M 500 350 L 525 350" stroke="#c8a96e" strokeWidth="2" markerEnd="url(#arrowhead)" />

    {/* Phase 3 */}
    <rect x="530" y="310" width="210" height="80" rx="8" fill="#151222" stroke="#4a3d60" />
    <text x="635" y="330" textAnchor="middle" fill="#f5cf85" fontSize="11" fontWeight="bold">Phase 3: Compare</text>
    <text x="635" y="350" textAnchor="middle" fill="#a89880" fontSize="9">Higher remaining value wins</text>
    <text x="635" y="365" textAnchor="middle" fill="#4ade80" fontSize="10">Attacker: 43</text>
    <text x="635" y="380" textAnchor="middle" fill="#fca5a5" fontSize="10">Defender: 11</text>

    {/* Result */}
    <rect x="560" y="405" width="150" height="30" rx="6" fill="#1a3a1a" stroke="#4ade80" />
    <text x="635" y="425" textAnchor="middle" fill="#4ade80" fontSize="11" fontWeight="bold">Attacker Wins!</text>

    {/* Win rate note */}
    <text x="300" y="420" fill="#a89880" fontSize="9">Higher stats → higher base value → more likely to win</text>
    <text x="300" y="435" fill="#a89880" fontSize="9">2-hex gap (e.g. 4 vs 2) ≈ 96% win rate for the stronger card</text>
    <text x="300" y="450" fill="#a89880" fontSize="9">Equal stats ≈ 50/50 (ties favour defender)</text>
    <text x="300" y="465" fill="#666" fontSize="8">Dampening reduces randomness so stat differences matter more</text>

    {/* Arrow marker */}
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#c8a96e" />
      </marker>
    </defs>
  </svg>
)
