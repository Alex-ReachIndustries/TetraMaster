import clsx from 'clsx'
import type { CardInstance, Direction, PlayerId } from '../../engine/types'
import { useSettingsStore } from '../../state'
import { CardArt } from './CardArt'

const arrowClass: Record<Direction, string> = {
  N: 'arrow--n',
  NE: 'arrow--ne',
  E: 'arrow--e',
  SE: 'arrow--se',
  S: 'arrow--s',
  SW: 'arrow--sw',
  W: 'arrow--w',
  NW: 'arrow--nw',
}

export const CardView = ({
  card,
  owner,
  faceDown = false,
  selected = false,
  onClick,
  size = 'medium',
  interactive = true,
}: {
  card: CardInstance
  owner?: PlayerId
  faceDown?: boolean
  selected?: boolean
  onClick?: () => void
  size?: 'small' | 'medium' | 'large'
  interactive?: boolean
}) => {
  const theme = useSettingsStore((state) => state.theme)
  const artModeOverride = useSettingsStore((state) => state.artModeOverride)
  const seed = useSettingsStore((state) => state.rngSeed)

  const content = faceDown ? (
    <div className="card__back">
      <span>TM</span>
    </div>
  ) : (
    <>
      <div className="card__art">
        <CardArt
          cardId={card.definitionId}
          name={card.name}
          theme={theme}
          artModeOverride={artModeOverride}
          seed={`${seed}-${card.definitionId}`}
        />
      </div>
      <div className="card__stats">
        <span className="stat stat--power">{card.stats.power}</span>
        <span className="stat stat--class">{card.stats.class}</span>
        <span className="stat stat--physical">{card.stats.physical}</span>
        <span className="stat stat--magical">{card.stats.magical}</span>
      </div>
      <div className="card__name">{card.name}</div>
      <div className="card__arrows">
        {card.arrows.map((dir) => (
          <span key={`${card.instanceId}-${dir}`} className={clsx('arrow', arrowClass[dir])} />
        ))}
      </div>
    </>
  )

  const className = clsx(
    'card',
    `card--${size}`,
    owner !== undefined && `card--owner-${owner}`,
    faceDown && 'card--facedown',
    selected && 'card--selected',
  )

  if (!interactive) {
    return <div className={className}>{content}</div>
  }

  return (
    <button type="button" className={className} onClick={onClick} aria-pressed={selected}>
      {content}
    </button>
  )
}
