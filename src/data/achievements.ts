import type { CardInstance } from '../engine/types'
import { isRegionComplete, campaignRegions } from './campaign'

export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  rarity: AchievementRarity
}

export const achievements: AchievementDef[] = [
  // ── Progress ──
  { id: 'first-win', name: 'First Victory', description: 'Win your first campaign match.', icon: '⚔', rarity: 'bronze' },
  { id: 'region-alexandria', name: 'Alexandrian Hero', description: 'Complete all nodes in Alexandria.', icon: '🏰', rarity: 'bronze' },
  { id: 'region-lindblum', name: 'Lindblum Champion', description: 'Complete all nodes in Lindblum.', icon: '🏙️', rarity: 'bronze' },
  { id: 'region-burmecia', name: 'Burmecian Valor', description: 'Complete all nodes in Burmecia.', icon: '🌧️', rarity: 'silver' },
  { id: 'region-treno', name: 'King of Treno', description: 'Complete all nodes in Treno.', icon: '🌙', rarity: 'silver' },
  { id: 'region-cleyra', name: 'Crown of Cleyra', description: 'Complete all nodes in Cleyra.', icon: '🌳', rarity: 'gold' },
  { id: 'region-desert-palace', name: 'Desert Conqueror', description: 'Complete all nodes in Desert Palace.', icon: '🏜️', rarity: 'gold' },
  { id: 'region-ipsens-castle', name: 'Ipsen Explorer', description: "Complete all nodes in Ipsen's Castle.", icon: '🏚️', rarity: 'gold' },
  { id: 'region-memoria', name: 'Memory Eternal', description: 'Complete all nodes in Memoria.', icon: '💎', rarity: 'platinum' },
  { id: 'journey-complete', name: 'Card Master', description: 'Complete all 40 campaign nodes.', icon: '👑', rarity: 'platinum' },

  // ── Combat ──
  { id: 'flawless', name: 'Flawless Victory', description: 'Win a match controlling all 10 cards on the board.', icon: '💯', rarity: 'gold' },
  { id: 'close-call', name: 'Close Call', description: 'Win a match by exactly 1 card (6-4).', icon: '😰', rarity: 'silver' },
  { id: 'win-streak-3', name: 'On a Roll', description: 'Win 3 matches in a row.', icon: '🔥', rarity: 'bronze' },
  { id: 'win-streak-5', name: 'Unstoppable', description: 'Win 5 matches in a row.', icon: '⚡', rarity: 'silver' },
  { id: 'boss-slayer', name: 'Boss Slayer', description: 'Defeat all 5 region bosses.', icon: '🗡️', rarity: 'gold' },
  { id: 'challenge-victor', name: 'Challenge Accepted', description: 'Win a challenge match.', icon: '🛡️', rarity: 'silver' },

  // ── Collection ──
  { id: 'collector-10', name: 'Card Enthusiast', description: 'Collect 10 cards.', icon: '📇', rarity: 'bronze' },
  { id: 'collector-25', name: 'Card Connoisseur', description: 'Collect 25 cards.', icon: '📚', rarity: 'silver' },
  { id: 'collector-50', name: 'Card Hoarder', description: 'Collect 50 cards.', icon: '🏛️', rarity: 'gold' },
  { id: 'rare-hunter', name: 'Rare Hunter', description: 'Collect a card with power 8 or higher.', icon: '💎', rarity: 'silver' },
  { id: 'legendary', name: 'Legendary Find', description: 'Collect a card with power C or higher.', icon: '🌟', rarity: 'gold' },
  { id: 'all-classes', name: 'Diversifier', description: 'Own at least one card of each battle class (P, M, X, A).', icon: '🎯', rarity: 'silver' },

  // ── Persistence ──
  { id: 'persistent', name: 'Never Give Up', description: 'Lose 5 times and keep playing.', icon: '💪', rarity: 'bronze' },
  { id: 'veteran', name: 'Veteran Player', description: 'Win 10 campaign matches.', icon: '🎖️', rarity: 'silver' },
]

export const getAchievement = (id: string): AchievementDef | undefined =>
  achievements.find((a) => a.id === id)

const hexVal = (h: string): number => parseInt(h, 16)

export interface AchievementContext {
  completedNodes: string[]
  wins: number
  losses: number
  collection: CardInstance[]
  currentWinStreak: number
  lastMatchScore?: { player: number; opponent: number }
  wasChallenge?: boolean
}

const bossNodeIds = campaignRegions.flatMap((r) => r.nodes.filter((n) => n.isBoss).map((n) => n.id))

export function checkAchievements(
  ctx: AchievementContext,
  alreadyUnlocked: string[],
): string[] {
  const unlocked = new Set(alreadyUnlocked)
  const newlyEarned: string[] = []

  const earn = (id: string) => {
    if (!unlocked.has(id)) {
      newlyEarned.push(id)
      unlocked.add(id)
    }
  }

  if (ctx.wins >= 1) earn('first-win')
  if (ctx.wins >= 10) earn('veteran')
  if (ctx.losses >= 5) earn('persistent')

  if (isRegionComplete('alexandria', ctx.completedNodes)) earn('region-alexandria')
  if (isRegionComplete('lindblum', ctx.completedNodes)) earn('region-lindblum')
  if (isRegionComplete('burmecia', ctx.completedNodes)) earn('region-burmecia')
  if (isRegionComplete('treno', ctx.completedNodes)) earn('region-treno')
  if (isRegionComplete('cleyra', ctx.completedNodes)) earn('region-cleyra')
  if (isRegionComplete('desert-palace', ctx.completedNodes)) earn('region-desert-palace')
  if (isRegionComplete('ipsens-castle', ctx.completedNodes)) earn('region-ipsens-castle')
  if (isRegionComplete('memoria', ctx.completedNodes)) earn('region-memoria')

  if (ctx.completedNodes.length >= 40) earn('journey-complete')

  if (bossNodeIds.every((id) => ctx.completedNodes.includes(id))) earn('boss-slayer')

  if (ctx.wasChallenge && ctx.lastMatchScore && ctx.lastMatchScore.player > ctx.lastMatchScore.opponent) {
    earn('challenge-victor')
  }

  if (ctx.lastMatchScore) {
    if (ctx.lastMatchScore.player === 10) earn('flawless')
    if (ctx.lastMatchScore.player === 6 && ctx.lastMatchScore.opponent === 4) earn('close-call')
  }

  if (ctx.currentWinStreak >= 3) earn('win-streak-3')
  if (ctx.currentWinStreak >= 5) earn('win-streak-5')

  if (ctx.collection.length >= 10) earn('collector-10')
  if (ctx.collection.length >= 25) earn('collector-25')
  if (ctx.collection.length >= 50) earn('collector-50')

  const hasPower8Plus = ctx.collection.some((c) => hexVal(c.stats.power) >= 8)
  if (hasPower8Plus) earn('rare-hunter')

  const hasPowerCPlus = ctx.collection.some((c) => hexVal(c.stats.power) >= 12)
  if (hasPowerCPlus) earn('legendary')

  const classes = new Set(ctx.collection.map((c) => c.stats.class))
  if (classes.has('P') && classes.has('M') && classes.has('X') && classes.has('A')) earn('all-classes')

  return newlyEarned
}
