/** Purely decorative antenna radiation pattern — not derived from the signal model. */

function hashSeed(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let state = seed
  return function random() {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateAntennaPatternPoints(seedKey: string, samples = 48): { x: number; y: number }[] {
  const rand = mulberry32(hashSeed(seedKey))
  const harmonics = Array.from({ length: 3 }, () => ({
    freq: 1 + Math.floor(rand() * 4),
    amp: 0.08 + rand() * 0.18,
    phase: rand() * Math.PI * 2,
  }))

  const points: { x: number; y: number }[] = []
  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2
    let r = 0.55
    for (const h of harmonics) {
      r += h.amp * Math.sin(h.freq * angle + h.phase)
    }
    r = Math.max(0.15, Math.min(0.95, r))
    points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r })
  }
  return points
}
