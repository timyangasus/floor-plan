import type { Band, LinkQuality } from '../types'

/**
 * Simplified geometric signal model — NOT a real RF measurement. Since the PWA has no
 * account/login and never talks to a physical router, coverage and backhaul quality are
 * estimated purely from placement (distance) and band, to give a planning approximation
 * similar in spirit to the reference tool's coverage map.
 */

const PATH_LOSS_EXPONENT: Record<Band, number> = {
  '2.4': 2.0,
  '5': 2.4,
  '6': 2.8,
}

export const SIGNAL_MIN_DBM = -95
export const SIGNAL_MAX_DBM = -25

export function estimateSignalDbm(distanceMeters: number, txPowerTier: number, band: Band): number {
  const baseAtOneMeter = -25 - (10 - txPowerTier) * 1.2
  const exponent = PATH_LOSS_EXPONENT[band]
  const distance = Math.max(distanceMeters, 0.3)
  const dbm = baseAtOneMeter - exponent * 10 * Math.log10(distance)
  return Math.min(SIGNAL_MAX_DBM, Math.max(SIGNAL_MIN_DBM, dbm))
}

export function bestSignalDbm(distancesWithTier: { distanceMeters: number; txPowerTier: number }[], band: Band): number {
  if (distancesWithTier.length === 0) return SIGNAL_MIN_DBM
  return Math.max(...distancesWithTier.map((d) => estimateSignalDbm(d.distanceMeters, d.txPowerTier, band)))
}

export function classifyLinkQuality(dbm: number): LinkQuality {
  if (dbm >= -67) return 'excellent'
  if (dbm >= -77) return 'good'
  return 'poor'
}

export function linkQualityLabel(quality: LinkQuality): string {
  switch (quality) {
    case 'excellent':
      return '極佳'
    case 'good':
      return '良好'
    case 'poor':
      return '不佳'
  }
}

export function linkQualityColor(quality: LinkQuality): string {
  switch (quality) {
    case 'excellent':
      return '#22c55e'
    case 'good':
      return '#eab308'
    case 'poor':
      return '#ef4444'
  }
}

/** Maps a dBm reading to a 0..1 strength value for heatmap color ramps. */
export function signalToStrength(dbm: number): number {
  const clamped = Math.min(SIGNAL_MAX_DBM, Math.max(SIGNAL_MIN_DBM, dbm))
  return (clamped - SIGNAL_MIN_DBM) / (SIGNAL_MAX_DBM - SIGNAL_MIN_DBM)
}

/** Red -> yellow -> green ramp, matching the reference app's "弱...強" legend bar. */
export function strengthToColor(strength: number): [number, number, number] {
  const t = Math.min(1, Math.max(0, strength))
  const stops: [number, [number, number, number]][] = [
    [0, [239, 68, 68]],
    [0.5, [234, 179, 8]],
    [1, [34, 197, 94]],
  ]
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i]
    const [t1, c1] = stops[i + 1]
    if (t >= t0 && t <= t1) {
      const localT = (t - t0) / (t1 - t0)
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * localT),
        Math.round(c0[1] + (c1[1] - c0[1]) * localT),
        Math.round(c0[2] + (c1[2] - c0[2]) * localT),
      ]
    }
  }
  return stops[stops.length - 1][1]
}

export function distanceInMeters(
  a: { x: number; y: number },
  b: { x: number; y: number },
  pxPerMeter: number,
): number {
  const dxPx = a.x - b.x
  const dyPx = a.y - b.y
  const distancePx = Math.sqrt(dxPx * dxPx + dyPx * dyPx)
  return distancePx / pxPerMeter
}
