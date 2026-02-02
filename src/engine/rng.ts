export interface RngState {
  state: number
}

export const hashSeed = (seed: string): number => {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const createRng = (seed: string): RngState => ({
  state: hashSeed(seed),
})

export const nextFloat = (rng: RngState): [number, RngState] => {
  let t = (rng.state + 0x6d2b79f5) >>> 0
  const s = t
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296
  return [value, { state: s }]
}

export const nextInt = (rng: RngState, min: number, max: number): [number, RngState] => {
  const [value, next] = nextFloat(rng)
  const range = max - min + 1
  return [Math.floor(value * range) + min, next]
}

export const nextBool = (rng: RngState, probability = 0.5): [boolean, RngState] => {
  const [value, next] = nextFloat(rng)
  return [value < probability, next]
}
