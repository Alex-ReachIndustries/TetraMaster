export interface LocalArtPayload {
  id: string
  name: string
  seed: string
}

export interface LocalArtResponse {
  dataUrl?: string
  imageUrl?: string
}

export const requestLocalArt = async (
  endpoint: string,
  payload: LocalArtPayload,
): Promise<string | null> => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    return null
  }
  const data = (await response.json()) as LocalArtResponse
  return data.dataUrl || data.imageUrl || null
}
