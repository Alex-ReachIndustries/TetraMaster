type CharacterStyle = {
  bodyColor: string
  hairColor: string
  accentColor: string
  symbol: string
  bgGrad: [string, string]
}

const characterStyles: Record<string, CharacterStyle> = {
  'alex-1': { bodyColor: '#e8c890', hairColor: '#8B4513', accentColor: '#44aa44', symbol: '🧒', bgGrad: ['#2a3a1a', '#1a2a0a'] },
  'alex-2': { bodyColor: '#c0a070', hairColor: '#555', accentColor: '#7788aa', symbol: '⚔️', bgGrad: ['#2a2a3a', '#1a1a2a'] },
  'alex-3': { bodyColor: '#e8c890', hairColor: '#aa6633', accentColor: '#aa66aa', symbol: '🧪', bgGrad: ['#2a1a2a', '#1a0a1a'] },
  'alex-4': { bodyColor: '#e8c890', hairColor: '#333', accentColor: '#ddaa44', symbol: '🎫', bgGrad: ['#3a2a1a', '#2a1a0a'] },
  'alex-5': { bodyColor: '#c0a070', hairColor: '#444', accentColor: '#8899cc', symbol: '🛡️', bgGrad: ['#1a1a3a', '#0a0a2a'] },

  'lind-1': { bodyColor: '#e8c890', hairColor: '#663300', accentColor: '#cc8844', symbol: '📇', bgGrad: ['#2a2a1a', '#1a1a0a'] },
  'lind-2': { bodyColor: '#e8c890', hairColor: '#cc9944', accentColor: '#dd6688', symbol: '🎭', bgGrad: ['#3a1a2a', '#2a0a1a'] },
  'lind-3': { bodyColor: '#c0a070', hairColor: '#555', accentColor: '#77aacc', symbol: '🔧', bgGrad: ['#1a2a3a', '#0a1a2a'] },
  'lind-4': { bodyColor: '#c0a070', hairColor: '#8B0000', accentColor: '#cc4444', symbol: '🗡️', bgGrad: ['#3a1a1a', '#2a0a0a'] },
  'lind-5': { bodyColor: '#c0a070', hairColor: '#888', accentColor: '#aabbcc', symbol: '📜', bgGrad: ['#2a2a2a', '#1a1a1a'] },

  'burm-1': { bodyColor: '#a08870', hairColor: '#444', accentColor: '#5588aa', symbol: '🌧️', bgGrad: ['#1a2a3a', '#0a1a2a'] },
  'burm-2': { bodyColor: '#a08870', hairColor: '#333', accentColor: '#668899', symbol: '⚔️', bgGrad: ['#1a1a2a', '#0a0a1a'] },
  'burm-3': { bodyColor: '#a08870', hairColor: '#5a3a2a', accentColor: '#66aacc', symbol: '💃', bgGrad: ['#0a2a3a', '#001a2a'] },
  'burm-4': { bodyColor: '#c0a080', hairColor: '#6a4a3a', accentColor: '#aaccee', symbol: '🔮', bgGrad: ['#1a1a3a', '#0a0a2a'] },
  'burm-5': { bodyColor: '#a08870', hairColor: '#444', accentColor: '#4488cc', symbol: '🐉', bgGrad: ['#0a1a3a', '#000a2a'] },

  'tren-1': { bodyColor: '#e8c890', hairColor: '#333', accentColor: '#ddaa33', symbol: '🏆', bgGrad: ['#2a2a1a', '#1a1a0a'] },
  'tren-2': { bodyColor: '#c0a070', hairColor: '#222', accentColor: '#888888', symbol: '🗡️', bgGrad: ['#1a1a1a', '#0a0a0a'] },
  'tren-3': { bodyColor: '#e8c890', hairColor: '#777', accentColor: '#aaaacc', symbol: '📖', bgGrad: ['#2a2a3a', '#1a1a2a'] },
  'tren-4': { bodyColor: '#e8c890', hairColor: '#aa8844', accentColor: '#ffcc44', symbol: '👑', bgGrad: ['#3a3a1a', '#2a2a0a'] },
  'tren-5': { bodyColor: '#e8c890', hairColor: '#111', accentColor: '#ffdd00', symbol: '♔', bgGrad: ['#3a2a0a', '#2a1a00'] },

  'cley-1': { bodyColor: '#c0b090', hairColor: '#5a4a3a', accentColor: '#44aa66', symbol: '🌿', bgGrad: ['#1a2a1a', '#0a1a0a'] },
  'cley-2': { bodyColor: '#c0b090', hairColor: '#8a6a4a', accentColor: '#cc88aa', symbol: '💃', bgGrad: ['#2a1a2a', '#1a0a1a'] },
  'cley-3': { bodyColor: '#c0b090', hairColor: '#aaa', accentColor: '#88bb88', symbol: '🌳', bgGrad: ['#0a2a0a', '#001a00'] },
  'cley-4': { bodyColor: '#c0b090', hairColor: '#fff', accentColor: '#aaddaa', symbol: '🙏', bgGrad: ['#1a3a1a', '#0a2a0a'] },
  'cley-5': { bodyColor: '#c0b090', hairColor: '#ddd', accentColor: '#bbddbb', symbol: '👁️', bgGrad: ['#0a3a1a', '#002a0a'] },

  'desp-1': { bodyColor: '#998870', hairColor: '#333', accentColor: '#cc9944', symbol: '🗡️', bgGrad: ['#3a2a1a', '#2a1a0a'] },
  'desp-2': { bodyColor: '#bb8899', hairColor: '#660044', accentColor: '#cc44aa', symbol: '🐍', bgGrad: ['#2a0a2a', '#1a001a'] },
  'desp-3': { bodyColor: '#c0a070', hairColor: '#4a2a4a', accentColor: '#8844cc', symbol: '📚', bgGrad: ['#1a0a2a', '#0a001a'] },
  'desp-4': { bodyColor: '#aa9988', hairColor: '#776655', accentColor: '#ccaa66', symbol: '🗿', bgGrad: ['#2a2a0a', '#1a1a00'] },
  'desp-5': { bodyColor: '#aa88aa', hairColor: '#440044', accentColor: '#cc66ff', symbol: '🎭', bgGrad: ['#2a002a', '#1a001a'] },

  'ipse-1': { bodyColor: '#aaa', hairColor: '#666', accentColor: '#8888aa', symbol: '🔦', bgGrad: ['#1a1a2a', '#0a0a1a'] },
  'ipse-2': { bodyColor: '#999', hairColor: '#444', accentColor: '#aa8866', symbol: '⚔️', bgGrad: ['#2a1a1a', '#1a0a0a'] },
  'ipse-3': { bodyColor: '#888', hairColor: '#555', accentColor: '#6688aa', symbol: '🔍', bgGrad: ['#0a1a2a', '#000a1a'] },
  'ipse-4': { bodyColor: '#777', hairColor: '#333', accentColor: '#66aaaa', symbol: '🏗️', bgGrad: ['#0a2a2a', '#001a1a'] },
  'ipse-5': { bodyColor: '#aaa', hairColor: '#222', accentColor: '#ccccee', symbol: '⚖️', bgGrad: ['#1a1a3a', '#0a0a2a'] },

  'mem-1': { bodyColor: '#8888bb', hairColor: '#4444aa', accentColor: '#aaaaff', symbol: '👻', bgGrad: ['#0a0a2a', '#00001a'] },
  'mem-2': { bodyColor: '#aa88bb', hairColor: '#6644aa', accentColor: '#cc88ff', symbol: '⏳', bgGrad: ['#1a002a', '#0a001a'] },
  'mem-3': { bodyColor: '#888', hairColor: '#444', accentColor: '#ffaaaa', symbol: '🩸', bgGrad: ['#2a0a0a', '#1a0000'] },
  'mem-4': { bodyColor: '#6666aa', hairColor: '#3333aa', accentColor: '#8888ff', symbol: '🌌', bgGrad: ['#00002a', '#00001a'] },
  'mem-5': { bodyColor: '#bb88ff', hairColor: '#8844dd', accentColor: '#ff88ff', symbol: '🔮', bgGrad: ['#1a003a', '#0a002a'] },
}

const defaultStyle: CharacterStyle = {
  bodyColor: '#aaa', hairColor: '#555', accentColor: '#888', symbol: '❓', bgGrad: ['#1a1a1a', '#0a0a0a'],
}

export const CharacterPortrait = ({ nodeId }: { nodeId: string }) => {
  const s = characterStyles[nodeId] ?? defaultStyle

  return (
    <svg viewBox="0 0 80 100" width="80" height="100" aria-hidden="true">
      <defs>
        <linearGradient id={`cp-bg-${nodeId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.bgGrad[0]} />
          <stop offset="100%" stopColor={s.bgGrad[1]} />
        </linearGradient>
        <radialGradient id={`cp-glow-${nodeId}`} cx="50%" cy="35%" r="50%">
          <stop offset="0%" stopColor={s.accentColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={s.accentColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="80" height="100" rx="8" fill={`url(#cp-bg-${nodeId})`} />
      <circle cx="40" cy="35" r="25" fill={`url(#cp-glow-${nodeId})`} />
      <text x="40" y="42" textAnchor="middle" dominantBaseline="central" fontSize="32">
        {s.symbol}
      </text>
      <rect x="10" y="78" width="60" height="2" rx="1" fill={s.accentColor} opacity="0.3" />
    </svg>
  )
}

const regionBattlefields: Record<string, { bg: [string, string]; overlay: string; accent: string }> = {
  alexandria: { bg: ['#1a2a3a', '#0d1a28'], overlay: '#2a3a5020', accent: '#6688aa' },
  lindblum: { bg: ['#2a2a1a', '#1a1a0d'], overlay: '#3a3a2020', accent: '#aa9966' },
  burmecia: { bg: ['#0d1a2a', '#061020'], overlay: '#1a3a5030', accent: '#4488bb' },
  treno: { bg: ['#0d0d1a', '#060610'], overlay: '#1a1a3020', accent: '#6666aa' },
  cleyra: { bg: ['#0d2a0d', '#061a06'], overlay: '#1a3a1a20', accent: '#44aa44' },
  'desert-palace': { bg: ['#2a1a0d', '#1a0d06'], overlay: '#3a2a1a20', accent: '#cc9944' },
  'ipsens-castle': { bg: ['#1a1a2a', '#0d0d1a'], overlay: '#2a2a3a20', accent: '#8888aa' },
  memoria: { bg: ['#0d0020', '#060014'], overlay: '#1a0a3030', accent: '#aa66ff' },
}

export const BattlefieldBackground = ({ regionId }: { regionId: string }) => {
  const bf = regionBattlefields[regionId] ?? regionBattlefields.alexandria

  return (
    <div className="battlefield-bg" style={{
      background: `linear-gradient(180deg, ${bf.bg[0]} 0%, ${bf.bg[1]} 100%)`,
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at 50% 40%, ${bf.accent}15 0%, transparent 70%)`,
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        background: `linear-gradient(0deg, ${bf.bg[1]} 0%, transparent 100%)`,
        opacity: 0.6,
      }} />
    </div>
  )
}
