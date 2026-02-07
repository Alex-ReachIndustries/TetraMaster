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
  classic: ['#0a0e28', '#161e48', '#2a3870', '#c8a44e', '#4a6898'],
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

  const shapes = Array.from({ length: 6 }).map((_, index) => ({
    x: rand() * 100,
    y: rand() * 120,
    w: 10 + rand() * 40,
    h: 10 + rand() * 40,
    r: rand() * 18,
    color: colors[index % colors.length],
    opacity: 0.3 + rand() * 0.5,
  }))

  return (
    <svg viewBox="0 0 100 140" aria-hidden="true" role="img">
      <rect width="100" height="140" fill={colors[0]} />
      <rect width="100" height="140" fill={colors[1]} opacity="0.45" />
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
        r={10 + rand() * 20}
        fill={colors[3]}
        opacity="0.4"
      />
      <path
        d={`M 0 ${100 + rand() * 40} Q 40 ${80 + rand() * 40} 100 ${100 + rand() * 40} V 140 H 0 Z`}
        fill={colors[2]}
        opacity="0.3"
      />
    </svg>
  )
}
