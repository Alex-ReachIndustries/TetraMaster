import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CardInstance } from '../engine/types'

export interface Deck {
  id: string
  name: string
  cards: CardInstance[]
  updatedAt: string
}

export interface DeckStoreState {
  decks: Deck[]
  activeDeckId: string | null
}

export interface DeckStoreActions {
  createDeck: (name: string) => string
  deleteDeck: (deckId: string) => void
  renameDeck: (deckId: string, name: string) => void
  setActiveDeck: (deckId: string) => void
  addCard: (deckId: string, card: CardInstance) => void
  removeCard: (deckId: string, cardInstanceId: string) => void
  updateCard: (deckId: string, cardInstanceId: string, card: CardInstance) => void
  replaceDeckCards: (deckId: string, cards: CardInstance[]) => void
  importDecks: (decks: Deck[]) => void
}

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `deck-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const useDeckStore = create<DeckStoreState & DeckStoreActions>()(
  persist(
    (set) => ({
      decks: [],
      activeDeckId: null,
      createDeck: (name) => {
        const id = createId()
        const deck: Deck = {
          id,
          name,
          cards: [],
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          decks: [...state.decks, deck],
          activeDeckId: id,
        }))
        return id
      },
      deleteDeck: (deckId) =>
        set((state) => ({
          decks: state.decks.filter((deck) => deck.id !== deckId),
          activeDeckId: state.activeDeckId === deckId ? null : state.activeDeckId,
        })),
      renameDeck: (deckId, name) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId ? { ...deck, name, updatedAt: new Date().toISOString() } : deck,
          ),
        })),
      setActiveDeck: (deckId) => set({ activeDeckId: deckId }),
      addCard: (deckId, card) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  cards: [...deck.cards, card],
                  updatedAt: new Date().toISOString(),
                }
              : deck,
          ),
        })),
      removeCard: (deckId, cardInstanceId) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  cards: deck.cards.filter((card) => card.instanceId !== cardInstanceId),
                  updatedAt: new Date().toISOString(),
                }
              : deck,
          ),
        })),
      updateCard: (deckId, cardInstanceId, card) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  cards: deck.cards.map((entry) =>
                    entry.instanceId === cardInstanceId ? card : entry,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : deck,
          ),
        })),
      replaceDeckCards: (deckId, cards) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  cards,
                  updatedAt: new Date().toISOString(),
                }
              : deck,
          ),
        })),
      importDecks: (decks) =>
        set({
          decks,
          activeDeckId: decks[0]?.id ?? null,
        }),
    }),
    {
      name: 'tetra-master-decks',
    },
  ),
)
