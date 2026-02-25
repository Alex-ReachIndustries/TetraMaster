import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CardInstance } from '../engine/types'
import { createCardInstance } from '../engine/cards'
import { createRng } from '../engine/rng'
import {
  starterCardIds,
  getCardDef,
  allCampaignNodes,
  isNodeAvailable,
  challengeModifiers,
  type ChallengeModifier,
} from '../data/campaign'
import { checkAchievements, type AchievementContext } from '../data/achievements'

export interface ActiveChallenge {
  nodeId: string
  modifier: ChallengeModifier
}

export interface CampaignStoreState {
  started: boolean
  collection: CardInstance[]
  campaignDeck: CardInstance[]
  completedNodes: string[]
  completedHardNodes: string[]
  wins: number
  losses: number
  activeChallenges: ActiveChallenge[]
  completedChallenges: string[]
  unlockedAchievements: string[]
  currentWinStreak: number
  pendingAchievements: string[]
  seenCutscenes: string[]
  pendingCutscene: string | null
}

export interface CampaignStoreActions {
  startCampaign: () => void
  resetCampaign: () => void
  completeNode: (nodeId: string) => void
  completeHardNode: (nodeId: string) => void
  addCardToCollection: (card: CardInstance) => void
  setCampaignDeck: (cards: CardInstance[]) => void
  addLoss: () => void
  rollChallenges: () => void
  completeChallenge: (nodeId: string) => void
  swapDeckCard: (outInstanceId: string, inCard: CardInstance) => void
  evaluateAchievements: (matchScore?: { player: number; opponent: number }, wasChallenge?: boolean) => void
  dismissAchievement: (id: string) => void
  triggerCutscene: (id: string) => void
  dismissCutscene: () => void
  exportSave: () => void
  importSave: (json: string) => boolean
}

const buildStarterCollection = (): CardInstance[] => {
  let rng = createRng('campaign-starter')
  const collection: CardInstance[] = []
  for (const id of starterCardIds) {
    const def = getCardDef(id)
    if (!def) continue
    const result = createCardInstance(def, rng, { mode: 'original', density: 0.5, minArrows: 3 })
    collection.push(result.card)
    rng = result.rng
  }
  return collection
}

export const useCampaignStore = create<CampaignStoreState & CampaignStoreActions>()(
  persist(
    (set, get) => ({
      started: false,
      collection: [],
      campaignDeck: [],
      completedNodes: [],
      completedHardNodes: [],
      wins: 0,
      losses: 0,
      activeChallenges: [],
      completedChallenges: [],
      unlockedAchievements: [],
      currentWinStreak: 0,
      pendingAchievements: [],
      seenCutscenes: [],
      pendingCutscene: null,

      startCampaign: () => {
        const collection = buildStarterCollection()
        set({
          started: true,
          collection,
          campaignDeck: collection.slice(0, 5),
          completedNodes: [],
          completedHardNodes: [],
          wins: 0,
          losses: 0,
          activeChallenges: [],
          completedChallenges: [],
          unlockedAchievements: [],
          currentWinStreak: 0,
          pendingAchievements: [],
          seenCutscenes: ['journey-start'],
          pendingCutscene: 'journey-start',
        })
      },

      resetCampaign: () =>
        set({
          started: false,
          collection: [],
          campaignDeck: [],
          completedNodes: [],
          completedHardNodes: [],
          wins: 0,
          losses: 0,
          activeChallenges: [],
          completedChallenges: [],
          unlockedAchievements: [],
          currentWinStreak: 0,
          pendingAchievements: [],
          seenCutscenes: [],
          pendingCutscene: null,
        }),

      completeNode: (nodeId: string) => {
        const state = get()
        if (state.completedNodes.includes(nodeId)) return
        set({
          completedNodes: [...state.completedNodes, nodeId],
          wins: state.wins + 1,
          currentWinStreak: state.currentWinStreak + 1,
        })
      },

      completeHardNode: (nodeId: string) => {
        const state = get()
        if (state.completedHardNodes.includes(nodeId)) return
        set({
          completedHardNodes: [...state.completedHardNodes, nodeId],
          wins: state.wins + 1,
          currentWinStreak: state.currentWinStreak + 1,
        })
      },

      addCardToCollection: (card: CardInstance) => {
        const state = get()
        set({ collection: [...state.collection, card] })
      },

      setCampaignDeck: (cards: CardInstance[]) => set({ campaignDeck: cards }),

      addLoss: () =>
        set((state) => ({
          losses: state.losses + 1,
          currentWinStreak: 0,
        })),

      swapDeckCard: (outInstanceId: string, inCard: CardInstance) => {
        const state = get()
        const deck = state.campaignDeck.map((c) =>
          c.instanceId === outInstanceId ? inCard : c,
        )
        set({ campaignDeck: deck })
      },

      rollChallenges: () => {
        const state = get()
        const completed = state.completedNodes
        const existing = state.activeChallenges.map((c) => c.nodeId)
        const alreadyDone = state.completedChallenges
        const eligible = allCampaignNodes.filter(
          (n) =>
            completed.includes(n.id) &&
            !existing.includes(n.id) &&
            !alreadyDone.includes(n.id) &&
            isNodeAvailable(n, completed),
        )
        if (eligible.length === 0) return
        const picked = eligible[Math.floor(Math.random() * eligible.length)]
        const modifier =
          challengeModifiers[Math.floor(Math.random() * challengeModifiers.length)]
        set({
          activeChallenges: [...state.activeChallenges, { nodeId: picked.id, modifier }],
        })
      },

      completeChallenge: (nodeId: string) => {
        const state = get()
        set({
          activeChallenges: state.activeChallenges.filter((c) => c.nodeId !== nodeId),
          completedChallenges: [...state.completedChallenges, nodeId],
          wins: state.wins + 1,
          currentWinStreak: state.currentWinStreak + 1,
        })
      },

      evaluateAchievements: (matchScore, wasChallenge) => {
        const state = get()
        const ctx: AchievementContext = {
          completedNodes: state.completedNodes,
          wins: state.wins,
          losses: state.losses,
          collection: state.collection,
          currentWinStreak: state.currentWinStreak,
          lastMatchScore: matchScore,
          wasChallenge,
        }
        const newlyEarned = checkAchievements(ctx, state.unlockedAchievements)
        if (newlyEarned.length > 0) {
          set({
            unlockedAchievements: [...state.unlockedAchievements, ...newlyEarned],
            pendingAchievements: [...state.pendingAchievements, ...newlyEarned],
          })
        }
      },

      dismissAchievement: (id: string) => {
        set((state) => ({
          pendingAchievements: state.pendingAchievements.filter((a) => a !== id),
        }))
      },

      triggerCutscene: (id: string) => {
        const state = get()
        if (state.seenCutscenes.includes(id)) return
        set({
          seenCutscenes: [...state.seenCutscenes, id],
          pendingCutscene: id,
        })
      },

      dismissCutscene: () => set({ pendingCutscene: null }),

      exportSave: () => {
        const state = get()
        const saveData: CampaignStoreState = {
          started: state.started,
          collection: state.collection,
          campaignDeck: state.campaignDeck,
          completedNodes: state.completedNodes,
          completedHardNodes: state.completedHardNodes,
          wins: state.wins,
          losses: state.losses,
          activeChallenges: state.activeChallenges,
          completedChallenges: state.completedChallenges,
          unlockedAchievements: state.unlockedAchievements,
          currentWinStreak: state.currentWinStreak,
          pendingAchievements: [],
          seenCutscenes: state.seenCutscenes,
          pendingCutscene: null,
        }
        const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tetra-master-save-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
      },

      importSave: (json: string): boolean => {
        try {
          const data = JSON.parse(json)
          if (typeof data.started !== 'boolean' || !Array.isArray(data.collection)) {
            return false
          }
          set({
            started: data.started ?? false,
            collection: data.collection ?? [],
            campaignDeck: data.campaignDeck ?? [],
            completedNodes: data.completedNodes ?? [],
            completedHardNodes: data.completedHardNodes ?? [],
            wins: data.wins ?? 0,
            losses: data.losses ?? 0,
            activeChallenges: data.activeChallenges ?? [],
            completedChallenges: data.completedChallenges ?? [],
            unlockedAchievements: data.unlockedAchievements ?? [],
            currentWinStreak: data.currentWinStreak ?? 0,
            pendingAchievements: [],
            seenCutscenes: data.seenCutscenes ?? [],
            pendingCutscene: null,
          })
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'tetra-master-campaign',
      partialize: (state) => {
        const { pendingAchievements: _, pendingCutscene: _2, ...rest } = state
        return rest
      },
    },
  ),
)
