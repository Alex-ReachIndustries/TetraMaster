import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ArtMode } from '../services/artProvider'
import type { ArrowGenerationMode } from '../engine/cards'

export type ThemeMode = 'classic' | 'modern'
export type BlockMode = 'random' | 'fixed'

export interface SettingsState {
  theme: ThemeMode
  reducedMotion: boolean
  aiRandomness: boolean
  aiThinkTimeMs: {
    easy: number
    medium: number
    hard: number
  }
  arrowMode: ArrowGenerationMode
  arrowDensity: number
  blockMode: BlockMode
  blockCount: number
  rngSeed: string
  showDevPanel: boolean
  artModeOverride: ArtMode | 'env'
  hideOpponentHand: boolean
}

export interface SettingsActions {
  setTheme: (theme: ThemeMode) => void
  setReducedMotion: (value: boolean) => void
  setAiRandomness: (value: boolean) => void
  setAiThinkTime: (key: keyof SettingsState['aiThinkTimeMs'], value: number) => void
  setArrowMode: (value: ArrowGenerationMode) => void
  setArrowDensity: (value: number) => void
  setBlockMode: (value: BlockMode) => void
  setBlockCount: (value: number) => void
  setRngSeed: (value: string) => void
  setShowDevPanel: (value: boolean) => void
  setArtModeOverride: (value: ArtMode | 'env') => void
  setHideOpponentHand: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      theme: 'classic',
      reducedMotion: false,
      aiRandomness: false,
      aiThinkTimeMs: {
        easy: 200,
        medium: 500,
        hard: 1000,
      },
      arrowMode: 'original',
      arrowDensity: 0.5,
      blockMode: 'random',
      blockCount: 0,
      rngSeed: 'tetra-master',
      showDevPanel: false,
      artModeOverride: 'env',
      hideOpponentHand: true,
      setTheme: (theme) => set({ theme }),
      setReducedMotion: (value) => set({ reducedMotion: value }),
      setAiRandomness: (value) => set({ aiRandomness: value }),
      setAiThinkTime: (key, value) =>
        set((state) => ({
          aiThinkTimeMs: {
            ...state.aiThinkTimeMs,
            [key]: value,
          },
        })),
      setArrowMode: (value) => set({ arrowMode: value }),
      setArrowDensity: (value) => set({ arrowDensity: value }),
      setBlockMode: (value) => set({ blockMode: value }),
      setBlockCount: (value) => set({ blockCount: value }),
      setRngSeed: (value) => set({ rngSeed: value }),
      setShowDevPanel: (value) => set({ showDevPanel: value }),
      setArtModeOverride: (value) => set({ artModeOverride: value }),
      setHideOpponentHand: (value) => set({ hideOpponentHand: value }),
    }),
    {
      name: 'tetra-master-settings',
    },
  ),
)
