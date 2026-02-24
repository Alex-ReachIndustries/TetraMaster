import { achievements, type AchievementDef, type AchievementRarity } from '../../data/achievements'

const rarityLabel: Record<AchievementRarity, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
}

const rarityOrder: Record<AchievementRarity, number> = {
  platinum: 0,
  gold: 1,
  silver: 2,
  bronze: 3,
}

export const AchievementList = ({
  unlocked,
  onClose,
}: {
  unlocked: string[]
  onClose: () => void
}) => {
  const unlockedSet = new Set(unlocked)
  const sorted = [...achievements].sort(
    (a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity],
  )
  const earned = sorted.filter((a) => unlockedSet.has(a.id))
  const locked = sorted.filter((a) => !unlockedSet.has(a.id))

  return (
    <div className="achievement-overlay">
      <div className="achievement-panel">
        <div className="achievement-panel__header">
          <h2>Achievements</h2>
          <span className="small">{unlocked.length}/{achievements.length}</span>
          <button className="button button--ghost" onClick={onClose}>✕</button>
        </div>
        <div className="achievement-grid">
          {earned.map((a) => (
            <AchievementCard key={a.id} def={a} unlocked />
          ))}
          {locked.map((a) => (
            <AchievementCard key={a.id} def={a} unlocked={false} />
          ))}
        </div>
      </div>
    </div>
  )
}

const AchievementCard = ({
  def,
  unlocked,
}: {
  def: AchievementDef
  unlocked: boolean
}) => (
  <div className={`achievement-card ${unlocked ? 'achievement-card--unlocked' : 'achievement-card--locked'} achievement-card--${def.rarity}`}>
    <div className="achievement-card__icon">{unlocked ? def.icon : '🔒'}</div>
    <div className="achievement-card__info">
      <div className="achievement-card__name">{unlocked ? def.name : '???'}</div>
      <div className="achievement-card__desc">{unlocked ? def.description : 'Keep playing to unlock.'}</div>
      <div className={`achievement-card__rarity achievement-rarity--${def.rarity}`}>
        {rarityLabel[def.rarity]}
      </div>
    </div>
  </div>
)
