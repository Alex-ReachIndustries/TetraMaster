import { create } from 'zustand'
import type { GameState } from '../engine/types'

export interface GameStoreState {
  game: GameState | null
}

export interface GameStoreActions {
  setGame: (game: GameState | null) => void
  updateGame: (game: GameState) => void
}

export const useGameStore = create<GameStoreState & GameStoreActions>((set) => ({
  game: null,
  setGame: (game) => set({ game }),
  updateGame: (game) => set({ game }),
}))
