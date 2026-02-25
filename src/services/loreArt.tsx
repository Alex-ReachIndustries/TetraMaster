import { hashSeed } from '../engine/rng'

type CardTheme = {
  bg: [string, string]
  accent: string
  symbol: string
  category: 'beast' | 'undead' | 'dragon' | 'magic' | 'summon' | 'weapon' | 'item' | 'airship' | 'location' | 'special'
}

const cardThemes: Record<string, CardTheme> = {
  '001': { bg: ['#2a3a1a', '#1a2a0a'], accent: '#6db33f', symbol: '👹', category: 'beast' },
  '002': { bg: ['#3a2a1a', '#2a1a0a'], accent: '#c47a3a', symbol: '🐺', category: 'beast' },
  '003': { bg: ['#1a1a2a', '#0a0a1a'], accent: '#8888aa', symbol: '💀', category: 'undead' },
  '004': { bg: ['#2a1a3a', '#1a0a2a'], accent: '#aa66cc', symbol: '🫧', category: 'magic' },
  '005': { bg: ['#2a2a1a', '#1a1a0a'], accent: '#aabb44', symbol: '🦏', category: 'beast' },
  '006': { bg: ['#1a2a2a', '#0a1a1a'], accent: '#44aa88', symbol: '🦎', category: 'beast' },
  '007': { bg: ['#1a1a1a', '#0a0a0a'], accent: '#77aa77', symbol: '🧟', category: 'undead' },
  '008': { bg: ['#3a1a0a', '#2a0a00'], accent: '#ff6622', symbol: '💣', category: 'magic' },
  '009': { bg: ['#2a2a2a', '#1a1a1a'], accent: '#8899aa', symbol: '🦾', category: 'beast' },
  '010': { bg: ['#0a2a3a', '#001a2a'], accent: '#3399cc', symbol: '🐟', category: 'beast' },
  '011': { bg: ['#1a2a3a', '#0a1a2a'], accent: '#aaccff', symbol: '❄️', category: 'beast' },
  '012': { bg: ['#2a1a1a', '#1a0a0a'], accent: '#cc6666', symbol: '📦', category: 'beast' },
  '013': { bg: ['#1a2a1a', '#0a1a0a'], accent: '#66cc88', symbol: '🌿', category: 'magic' },
  '014': { bg: ['#1a3a1a', '#0a2a0a'], accent: '#44dd44', symbol: '🌱', category: 'magic' },
  '015': { bg: ['#2a1a0a', '#1a0a00'], accent: '#aa7744', symbol: '🐛', category: 'beast' },
  '016': { bg: ['#3a2a0a', '#2a1a00'], accent: '#ccaa33', symbol: '🦂', category: 'beast' },
  '017': { bg: ['#2a1a3a', '#1a0a2a'], accent: '#cc88ff', symbol: '🧚', category: 'magic' },
  '018': { bg: ['#3a3a2a', '#2a2a1a'], accent: '#bbaa77', symbol: '🗿', category: 'beast' },
  '019': { bg: ['#1a2a3a', '#0a1a2a'], accent: '#66aacc', symbol: '🦅', category: 'beast' },
  '020': { bg: ['#0a2a2a', '#001a1a'], accent: '#33ccaa', symbol: '🪰', category: 'beast' },
  '021': { bg: ['#2a1a1a', '#1a0a0a'], accent: '#aa5555', symbol: '🪱', category: 'beast' },
  '022': { bg: ['#1a0a0a', '#0a0000'], accent: '#dd4444', symbol: '🐕', category: 'beast' },
  '023': { bg: ['#3a2a1a', '#2a1a0a'], accent: '#cc8844', symbol: '🐜', category: 'beast' },
  '024': { bg: ['#1a3a0a', '#0a2a00'], accent: '#33dd33', symbol: '🌵', category: 'special' },
  '025': { bg: ['#3a3a1a', '#2a2a0a'], accent: '#ddcc44', symbol: '🐱', category: 'beast' },
  '026': { bg: ['#2a2a3a', '#1a1a2a'], accent: '#9999cc', symbol: '🎭', category: 'special' },
  '027': { bg: ['#2a1a2a', '#1a0a1a'], accent: '#cc77aa', symbol: '🦔', category: 'beast' },
  '028': { bg: ['#1a2a1a', '#0a1a0a'], accent: '#77bb55', symbol: '🐍', category: 'beast' },
  '029': { bg: ['#0a2a0a', '#001a00'], accent: '#44bb44', symbol: '🌺', category: 'beast' },
  '030': { bg: ['#2a2a1a', '#1a1a0a'], accent: '#99aa66', symbol: '👹', category: 'beast' },
  '031': { bg: ['#1a1a0a', '#0a0a00'], accent: '#aaaa33', symbol: '🪲', category: 'beast' },
  '032': { bg: ['#2a0a1a', '#1a000a'], accent: '#cc3366', symbol: '👾', category: 'beast' },
  '033': { bg: ['#1a1a3a', '#0a0a2a'], accent: '#6688dd', symbol: '🌪️', category: 'magic' },
  '034': { bg: ['#2a1a0a', '#1a0a00'], accent: '#aa7733', symbol: '🦑', category: 'beast' },
  '035': { bg: ['#2a1a2a', '#1a0a1a'], accent: '#aa66aa', symbol: '📖', category: 'magic' },
  '036': { bg: ['#1a1a2a', '#0a0a1a'], accent: '#8888dd', symbol: '🐉', category: 'dragon' },
  '037': { bg: ['#2a2a3a', '#1a1a2a'], accent: '#aaaacc', symbol: '🪶', category: 'beast' },
  '038': { bg: ['#2a0a2a', '#1a001a'], accent: '#cc44cc', symbol: '👁️', category: 'magic' },
  '039': { bg: ['#2a2a0a', '#1a1a00'], accent: '#bbbb33', symbol: '👹', category: 'beast' },
  '040': { bg: ['#1a2a2a', '#0a1a1a'], accent: '#55aaaa', symbol: '💪', category: 'beast' },
  '041': { bg: ['#1a1a1a', '#0a0a0a'], accent: '#999999', symbol: '🔥', category: 'undead' },
  '042': { bg: ['#0a0a1a', '#00000a'], accent: '#6666bb', symbol: '👻', category: 'undead' },
  '043': { bg: ['#2a2a2a', '#1a1a1a'], accent: '#aaaaaa', symbol: '🗡️', category: 'beast' },
  '044': { bg: ['#1a0a2a', '#0a001a'], accent: '#7744bb', symbol: '🦇', category: 'beast' },
  '045': { bg: ['#1a1a2a', '#0a0a1a'], accent: '#7777aa', symbol: '⚔️', category: 'undead' },
  '046': { bg: ['#0a1a0a', '#000a00'], accent: '#44aa44', symbol: '🔪', category: 'special' },
  '047': { bg: ['#2a1a2a', '#1a0a1a'], accent: '#bb77bb', symbol: '🎖️', category: 'beast' },
  '048': { bg: ['#2a1a0a', '#1a0a00'], accent: '#dd7722', symbol: '🦅', category: 'beast' },
  '049': { bg: ['#0a2a0a', '#001a00'], accent: '#33bb33', symbol: '🌿', category: 'beast' },
  '050': { bg: ['#2a2a3a', '#1a1a2a'], accent: '#aabbdd', symbol: '⚡', category: 'magic' },
  '051': { bg: ['#2a0a0a', '#1a0000'], accent: '#cc3333', symbol: '😈', category: 'beast' },
  '052': { bg: ['#1a0a2a', '#0a001a'], accent: '#8833cc', symbol: '🦣', category: 'beast' },
  '053': { bg: ['#2a2a2a', '#1a1a1a'], accent: '#cccccc', symbol: '🤖', category: 'beast' },
  '054': { bg: ['#1a1a3a', '#0a0a2a'], accent: '#5577ee', symbol: '🐲', category: 'dragon' },
  '055': { bg: ['#2a0a3a', '#1a002a'], accent: '#cc44ff', symbol: '🔮', category: 'special' },
  '056': { bg: ['#1a0a0a', '#0a0000'], accent: '#ff2222', symbol: '💀', category: 'special' },
  '057': { bg: ['#3a3a3a', '#2a2a2a'], accent: '#ffffff', symbol: '✨', category: 'magic' },
  '058': { bg: ['#3a1a0a', '#2a0a00'], accent: '#ff6600', symbol: '☄️', category: 'magic' },
  '059': { bg: ['#3a0a0a', '#2a0000'], accent: '#ff3300', symbol: '🔥', category: 'magic' },
  '060': { bg: ['#0a1a3a', '#00102a'], accent: '#66bbff', symbol: '❄️', category: 'summon' },
  '061': { bg: ['#3a0a00', '#2a0000'], accent: '#ff4400', symbol: '🔥', category: 'summon' },
  '062': { bg: ['#1a1a3a', '#0a0a2a'], accent: '#ffdd00', symbol: '⚡', category: 'summon' },
  '063': { bg: ['#1a0a2a', '#0a001a'], accent: '#9944dd', symbol: '🌀', category: 'summon' },
  '064': { bg: ['#1a1a2a', '#0a0a1a'], accent: '#aaaaee', symbol: '⚔️', category: 'summon' },
  '065': { bg: ['#0a1a2a', '#000a1a'], accent: '#3388dd', symbol: '🌊', category: 'summon' },
  '066': { bg: ['#0a0a2a', '#00001a'], accent: '#4455ff', symbol: '🐲', category: 'summon' },
  '067': { bg: ['#1a0a1a', '#0a000a'], accent: '#bb44bb', symbol: '🚀', category: 'summon' },
  '068': { bg: ['#1a2a1a', '#0a1a0a'], accent: '#77cc77', symbol: '🐺', category: 'summon' },
  '069': { bg: ['#3a2a3a', '#2a1a2a'], accent: '#dd88dd', symbol: '👼', category: 'summon' },
  '070': { bg: ['#2a2a3a', '#1a1a2a'], accent: '#ccddff', symbol: '🏰', category: 'summon' },
  '071': { bg: ['#3a3a1a', '#2a2a0a'], accent: '#ffdd44', symbol: '⚔️', category: 'weapon' },
  '072': { bg: ['#2a1a3a', '#1a0a2a'], accent: '#aa77ff', symbol: '🗡️', category: 'weapon' },
  '073': { bg: ['#1a1a2a', '#0a0a1a'], accent: '#99aadd', symbol: '⚔️', category: 'weapon' },
  '074': { bg: ['#0a3a0a', '#002a00'], accent: '#33ff33', symbol: '🧪', category: 'item' },
  '075': { bg: ['#1a0a1a', '#0a000a'], accent: '#aa33aa', symbol: '💎', category: 'item' },
  '076': { bg: ['#3a1a2a', '#2a0a1a'], accent: '#ff77aa', symbol: '🎀', category: 'item' },
  '077': { bg: ['#3a3a2a', '#2a2a1a'], accent: '#ddcc88', symbol: '🏸', category: 'weapon' },
  '078': { bg: ['#2a2a3a', '#1a1a2a'], accent: '#aabbee', symbol: '👑', category: 'weapon' },
  '079': { bg: ['#2a1a1a', '#1a0a0a'], accent: '#dd8866', symbol: '🛡️', category: 'item' },
  '080': { bg: ['#2a2a2a', '#1a1a1a'], accent: '#bbbbbb', symbol: '⚔️', category: 'weapon' },
  '081': { bg: ['#0a1a2a', '#000a1a'], accent: '#3388cc', symbol: '⛵', category: 'airship' },
  '082': { bg: ['#2a2a3a', '#1a1a2a'], accent: '#aabbdd', symbol: '🚢', category: 'airship' },
  '083': { bg: ['#1a0a2a', '#0a001a'], accent: '#7733dd', symbol: '🛸', category: 'airship' },
  '084': { bg: ['#2a2a1a', '#1a1a0a'], accent: '#aaaa77', symbol: '🚢', category: 'airship' },
  '085': { bg: ['#1a2a2a', '#0a1a1a'], accent: '#55aabb', symbol: '✈️', category: 'airship' },
  '086': { bg: ['#3a0a0a', '#2a0000'], accent: '#ff4444', symbol: '🌹', category: 'airship' },
  '087': { bg: ['#2a1a1a', '#1a0a0a'], accent: '#cc8877', symbol: '🎭', category: 'airship' },
  '088': { bg: ['#1a1a2a', '#0a0a1a'], accent: '#7788cc', symbol: '⚓', category: 'airship' },
  '089': { bg: ['#3a3a0a', '#2a2a00'], accent: '#ffdd00', symbol: '🐤', category: 'special' },
  '090': { bg: ['#3a3a1a', '#2a2a0a'], accent: '#ffcc33', symbol: '🐔', category: 'special' },
  '091': { bg: ['#3a2a3a', '#2a1a2a'], accent: '#ffaacc', symbol: '🧸', category: 'special' },
  '092': { bg: ['#0a2a0a', '#001a00'], accent: '#33bb33', symbol: '🐸', category: 'special' },
  '093': { bg: ['#2a2a0a', '#1a1a00'], accent: '#aaaa33', symbol: '🪲', category: 'special' },
  '094': { bg: ['#2a2a3a', '#1a1a2a'], accent: '#ccccee', symbol: '🏰', category: 'location' },
  '095': { bg: ['#1a2a2a', '#0a1a1a'], accent: '#66bbaa', symbol: '🏙️', category: 'location' },
  '096': { bg: ['#0a0a2a', '#00001a'], accent: '#4466cc', symbol: '🌙', category: 'location' },
  '097': { bg: ['#2a1a0a', '#1a0a00'], accent: '#aa7744', symbol: '🐛', category: 'special' },
  '098': { bg: ['#2a2a3a', '#1a1a2a'], accent: '#bbbbee', symbol: '📝', category: 'special' },
  '099': { bg: ['#3a2a0a', '#2a1a00'], accent: '#eebb33', symbol: '🐴', category: 'special' },
  '100': { bg: ['#1a2a3a', '#0a1a2a'], accent: '#6699dd', symbol: '✈️', category: 'airship' },
}

const categoryGradients: Record<string, [string, string]> = {
  beast: ['#2a3020', '#1a200a'],
  undead: ['#1a1a28', '#0a0a14'],
  dragon: ['#20142a', '#100a1a'],
  magic: ['#141a2a', '#0a0e1a'],
  summon: ['#0a1428', '#001020'],
  weapon: ['#28281a', '#18180a'],
  item: ['#1a2820', '#0a1810'],
  airship: ['#141e2a', '#0a1420'],
  location: ['#1e1e28', '#0e0e18'],
  special: ['#282018', '#181008'],
}

const defaultTheme: CardTheme = {
  bg: ['#1a1a2a', '#0a0a1a'],
  accent: '#888888',
  symbol: '❓',
  category: 'beast',
}

export const LoreArt = ({ cardId }: { cardId: string }) => {
  const theme = cardThemes[cardId] ?? defaultTheme
  const seed = hashSeed(cardId)
  const rand = makeRng(seed)

  const bgGrad = theme.bg
  const catGrad = categoryGradients[theme.category] ?? categoryGradients.beast

  return (
    <svg viewBox="0 0 100 140" aria-hidden="true" role="img">
      <defs>
        <linearGradient id={`bg-${cardId}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={bgGrad[0]} />
          <stop offset="100%" stopColor={bgGrad[1]} />
        </linearGradient>
        <radialGradient id={`glow-${cardId}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={theme.accent} stopOpacity="0.25" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`floor-${cardId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={catGrad[0]} stopOpacity="0.6" />
          <stop offset="100%" stopColor={catGrad[1]} stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="100" height="140" fill={`url(#bg-${cardId})`} />

      {/* Ambient glow */}
      <circle cx="50" cy="55" r="45" fill={`url(#glow-${cardId})`} />

      {/* Decorative elements based on category */}
      {theme.category === 'summon' && (
        <>
          <circle cx="50" cy="50" r="30" fill="none" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
          <circle cx="50" cy="50" r="22" fill="none" stroke={theme.accent} strokeWidth="0.3" opacity="0.2" />
        </>
      )}
      {theme.category === 'dragon' && (
        <path d={`M 10 120 Q 50 ${90 + rand() * 15} 90 120`} fill="none" stroke={theme.accent} strokeWidth="0.8" opacity="0.2" />
      )}
      {theme.category === 'weapon' && (
        <>
          <line x1="30" y1="20" x2="70" y2="20" stroke={theme.accent} strokeWidth="0.5" opacity="0.15" />
          <line x1="30" y1="100" x2="70" y2="100" stroke={theme.accent} strokeWidth="0.5" opacity="0.15" />
        </>
      )}
      {theme.category === 'undead' && (
        <rect x="5" y="5" width="90" height="130" rx="4" fill="none" stroke={theme.accent} strokeWidth="0.4" opacity="0.1" strokeDasharray="3 2" />
      )}

      {/* Accent shapes */}
      <ellipse
        cx={25 + rand() * 50}
        cy={80 + rand() * 30}
        rx={20 + rand() * 20}
        ry={8 + rand() * 10}
        fill={theme.accent}
        opacity="0.08"
      />

      {/* Floor/ground */}
      <rect x="0" y="95" width="100" height="45" fill={`url(#floor-${cardId})`} />

      {/* Central symbol */}
      <text
        x="50"
        y="62"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="36"
        style={{ filter: `drop-shadow(0 2px 6px ${theme.accent}44)` }}
      >
        {theme.symbol}
      </text>

      {/* Accent line at top */}
      <rect x="15" y="8" width="70" height="1.5" rx="1" fill={theme.accent} opacity="0.3" />
      <rect x="25" y="12" width="50" height="0.8" rx="0.5" fill={theme.accent} opacity="0.15" />
    </svg>
  )
}

function makeRng(seed: number) {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}
