import { hashSeed } from '../engine/rng'

const makeRng = (seed: number) => {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

const palette = {
  classic: ['#0a1030', '#1a2260', '#384890', '#c8a050', '#5868a0'],
  modern: ['#0f172a', '#1e293b', '#38bdf8', '#f8fafc', '#94a3b8'],
}

export const ProceduralArt = ({
  cardId,
  name,
  theme,
}: {
  cardId: string
  name: string
  theme: 'classic' | 'modern'
}) => {
  const seed = hashSeed(`${cardId}-${name}`)
  const rand = makeRng(seed)
  const colors = theme === 'classic' ? palette.classic : palette.modern

  const shapes = Array.from({ length: 8 }).map((_, index) => ({
    x: rand() * 100,
    y: rand() * 120,
    w: 8 + rand() * 35,
    h: 8 + rand() * 35,
    r: rand() * 14,
    color: colors[index % colors.length],
    opacity: 0.25 + rand() * 0.45,
  }))

  return (
    <svg viewBox="0 0 100 140" aria-hidden="true" role="img">
      <defs>
        <linearGradient id={`bg-${cardId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
        <radialGradient id={`glow-${cardId}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={colors[3]} stopOpacity="0.2" />
          <stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="140" fill={`url(#bg-${cardId})`} />
      <rect width="100" height="140" fill={`url(#glow-${cardId})`} />
      {shapes.map((shape, index) => (
        <rect
          key={`rect-${index}`}
          x={shape.x}
          y={shape.y}
          width={shape.w}
          height={shape.h}
          rx={shape.r}
          ry={shape.r}
          fill={shape.color}
          opacity={shape.opacity}
        />
      ))}
      <circle
        cx={20 + rand() * 60}
        cy={20 + rand() * 80}
        r={8 + rand() * 18}
        fill={colors[3]}
        opacity="0.2"
      />
      <circle
        cx={30 + rand() * 40}
        cy={50 + rand() * 50}
        r={5 + rand() * 12}
        fill={colors[4]}
        opacity="0.15"
      />
      <path
        d={`M 0 ${100 + rand() * 30} Q 50 ${80 + rand() * 30} 100 ${100 + rand() * 30} V 140 H 0 Z`}
        fill={colors[2]}
        opacity="0.2"
      />
      {/* Subtle vignette border */}
      <rect
        width="100"
        height="140"
        fill="none"
        stroke={colors[4]}
        strokeWidth="1"
        opacity="0.15"
      />
    </svg>
  )
}
