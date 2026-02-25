import { useEffect, useRef, useState } from 'react'
import { getAchievement, type AchievementRarity } from '../../data/achievements'
import { useCampaignStore } from '../../state/campaignStore'

const rarityLabel: Record<AchievementRarity, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
}

export const AchievementToast = () => {
  const pending = useCampaignStore((s) => s.pendingAchievements)
  const dismiss = useCampaignStore((s) => s.dismissAchievement)
  const [visible, setVisible] = useState<string | null>(null)
  const [animating, setAnimating] = useState(false)
  const showTimer = useRef<number | null>(null)
  const hideTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (showTimer.current) window.clearTimeout(showTimer.current)
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
    }
  }, [])

  useEffect(() => {
    if (visible || pending.length === 0) return
    const next = pending[0]
    setVisible(next)
    setAnimating(true)

    showTimer.current = window.setTimeout(() => {
      setAnimating(false)
      hideTimer.current = window.setTimeout(() => {
        dismiss(next)
        setVisible(null)
      }, 400)
    }, 3000)

    return () => {
      if (showTimer.current) { window.clearTimeout(showTimer.current); showTimer.current = null }
      if (hideTimer.current) { window.clearTimeout(hideTimer.current); hideTimer.current = null }
    }
  }, [pending, visible, dismiss])

  if (!visible) return null
  const def = getAchievement(visible)
  if (!def) return null

  return (
    <div
      className={`achievement-toast ${animating ? 'achievement-toast--in' : 'achievement-toast--out'} achievement-toast--${def.rarity}`}
      onClick={() => {
        if (showTimer.current) { window.clearTimeout(showTimer.current); showTimer.current = null }
        if (hideTimer.current) { window.clearTimeout(hideTimer.current); hideTimer.current = null }
        dismiss(visible)
        setVisible(null)
      }}
    >
      <div className="achievement-toast__icon">{def.icon}</div>
      <div className="achievement-toast__body">
        <div className="achievement-toast__label">Achievement Unlocked!</div>
        <div className="achievement-toast__name">{def.name}</div>
        <div className="achievement-toast__desc">{def.description}</div>
        <div className={`achievement-toast__rarity achievement-rarity--${def.rarity}`}>
          {rarityLabel[def.rarity]}
        </div>
      </div>
    </div>
  )
}
