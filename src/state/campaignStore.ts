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

export interface ActiveChallenge {
  nodeId: string
  modifier: ChallengeModifier
}

export interface CampaignStoreState {
  started: boolean
  collection: CardInstance[]
  campaignDeck: CardInstance[]
  completedNodes: string[]
  wins: number
  losses: number
  activeChallenges: ActiveChallenge[]
  completedChallenges: string[]
}

export interface CampaignStoreActions {
  startCampaign: () => void
  resetCampaign: () => void
  completeNode: (nodeId: string) => void
  addCardToCollection: (card: CardInstance) => void
  setCampaignDeck: (cards: CardInstance[]) => void
  addLoss: () => void
  rollChallenges: () => void
  completeChallenge: (nodeId: string) => void
  swapDeckCard: (outInstanceId: string, inCard: CardInstance) => void
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
      wins: 0,
      losses: 0,
      activeChallenges: [],
      completedChallenges: [],

      startCampaign: () => {
        const collection = buildStarterCollection()
        set({
          started: true,
          collection,
          campaignDeck: collection.slice(0, 5),
          completedNodes: [],
          wins: 0,
          losses: 0,
          activeChallenges: [],
          completedChallenges: [],
        })
      },

      resetCampaign: () =>
        set({
          started: false,
          collection: [],
          campaignDeck: [],
          completedNodes: [],
          wins: 0,
          losses: 0,
          activeChallenges: [],
          completedChallenges: [],
        }),

      completeNode: (nodeId: string) => {
        const state = get()
        if (state.completedNodes.includes(nodeId)) return
        set({
          completedNodes: [...state.completedNodes, nodeId],
          wins: state.wins + 1,
        })
      },

      addCardToCollection: (card: CardInstance) => {
        const state = get()
        set({ collection: [...state.collection, card] })
      },

      setCampaignDeck: (cards: CardInstance[]) => set({ campaignDeck: cards }),

      addLoss: () => set((state) => ({ losses: state.losses + 1 })),

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
        })
      },
    }),
    {
      name: 'tetra-master-campaign',
    },
  ),
)
