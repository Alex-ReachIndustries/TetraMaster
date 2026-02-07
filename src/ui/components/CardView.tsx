import clsx from 'clsx'
import type { CSSProperties } from 'react'
import type { CardInstance, Direction, PlayerId } from '../../engine/types'
import { useSettingsStore } from '../../state'
import { CAPTURE_FLASH_MS, PLACE_FLASH_MS } from '../animationConfig'
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
  flash,
  showPower = false,
  overridePower,
}: {
  card: CardInstance
  owner?: PlayerId
  faceDown?: boolean
  selected?: boolean
  onClick?: () => void
  size?: 'small' | 'medium' | 'large'
  interactive?: boolean
  flash?: 'place' | 'capture'
  /** Show the big number in the centre (e.g. countdown HP during battle) */
  showPower?: boolean
  /** When showPower, use this value instead of card.stats.power (e.g. battle countdown HP) */
  overridePower?: number
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
        {showPower && (
          <div className="card__power" aria-hidden="true">
            {overridePower !== undefined ? overridePower : card.stats.power}
          </div>
        )}
      </div>
      <div className="card__stats">
        <span className="stat-code">
          {card.stats.power}
          {card.stats.class}
          {card.stats.physical}
          {card.stats.magical}
        </span>
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
    flash && `card--flash-${flash}`,
  )
  const styleVars: CSSProperties & Record<string, string> = {
    '--flash-place-ms': `${PLACE_FLASH_MS}ms`,
    '--flash-capture-ms': `${CAPTURE_FLASH_MS}ms`,
  }

  if (!interactive) {
    return (
      <div className={className} data-owner={owner} style={styleVars}>
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-pressed={selected}
      data-owner={owner}
      style={styleVars}
    >
      {content}
    </button>
  )
}
