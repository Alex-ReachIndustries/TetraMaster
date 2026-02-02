export type ArtMode = 'procedural' | 'generated' | 'local'

export const getEnvArtMode = (): ArtMode => {
  const mode = import.meta.env.VITE_ART_PROVIDER as ArtMode | undefined
  if (mode === 'generated' || mode === 'local' || mode === 'procedural') {
    return mode
  }
  return 'procedural'
}

export const getLocalArtEndpoint = (): string =>
  import.meta.env.VITE_LOCAL_ART_ENDPOINT || 'http://localhost:8081/card'

export const getGeneratedArtPath = (cardId: string): string => `/generated/${cardId}.png`
