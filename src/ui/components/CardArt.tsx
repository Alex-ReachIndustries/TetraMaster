import { useEffect, useMemo, useState } from 'react'
import { getEnvArtMode, getGeneratedArtPath, getLocalArtEndpoint } from '../../services'
import { requestLocalArt } from '../../services/localArt'
import { ProceduralArt } from '../../services/proceduralArt'

export const CardArt = ({
  cardId,
  name,
  theme,
  artModeOverride,
  seed,
}: {
  cardId: string
  name: string
  theme: 'classic' | 'modern'
  artModeOverride: 'env' | 'procedural' | 'generated' | 'local'
  seed: string
}) => {
  const mode = useMemo(
    () => (artModeOverride === 'env' ? getEnvArtMode() : artModeOverride),
    [artModeOverride],
  )
  const [localSrc, setLocalSrc] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== 'local') return undefined
    let cancelled = false
    requestLocalArt(getLocalArtEndpoint(), { id: cardId, name, seed }).then((dataUrl) => {
      if (!cancelled) {
        setLocalSrc(dataUrl)
      }
    })
    return () => {
      cancelled = true
    }
  }, [mode, cardId, name, seed])

  const imageSrc = mode === 'local' ? localSrc : mode === 'generated' ? getGeneratedArtPath(cardId) : null

  if (imageSrc) {
    return <img src={imageSrc} alt={`${name} art`} />
  }

  return <ProceduralArt cardId={cardId} name={name} theme={theme} />
}
