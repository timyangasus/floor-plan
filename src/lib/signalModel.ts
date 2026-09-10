import type { Band, LinkQuality, Wall } from '../types'
import { getWallMaterial } from '../data/wallMaterials'

/**
 * Simplified geometric signal model — NOT a real RF measurement. Since the PWA has no
 * account/login and never talks to a physical router, coverage and backhaul quality are
 * estimated purely from placement (distance) and band, to give a planning approximation
 * similar in spirit to the reference tool's coverage map.
 */

// Log-distance path loss (free-space-like falloff) plus a flat per-meter term that stands
// in for the walls/furniture a real home has along the way — without it, distances typical
// of a small apartment barely attenuate at all and the whole floor plan reads as "excellent".
// Higher bands carry both a steeper exponent and heavier per-meter loss, matching how 6GHz
// in particular struggles to clear even a couple of interior walls compared to 2.4GHz.
const PATH_LOSS_EXPONENT: Record<Band, number> = {
  '2.4': 2.2,
  '5': 2.6,
  '6': 3.0,
}

const ATTENUATION_PER_METER_DB: Record<Band, number> = {
  '2.4': 2.2,
  '5': 3.2,
  '6': 4.2,
}

export const SIGNAL_MIN_DBM = -95
export const SIGNAL_MAX_DBM = -20

/**
 * Wall material dB ratings are labeled at 5GHz in the reference app; scale for other bands
 * since higher frequencies are attenuated more by the same physical obstruction.
 */
const BAND_MATERIAL_SCALE: Record<Band, number> = {
  '2.4': 0.7,
  '5': 1.0,
  '6': 1.3,
}

export function estimateSignalDbm(
  distanceMeters: number,
  txPowerTier: number,
  band: Band,
  wallAttenuationDb = 0,
): number {
  const baseAtOneMeter = -22 - (10 - txPowerTier) * 1.4
  const exponent = PATH_LOSS_EXPONENT[band]
  const attenuationPerMeter = ATTENUATION_PER_METER_DB[band]
  const distance = Math.max(distanceMeters, 0.3)
  const dbm =
    baseAtOneMeter - exponent * 10 * Math.log10(distance) - attenuationPerMeter * distance - wallAttenuationDb
  return Math.min(SIGNAL_MAX_DBM, Math.max(SIGNAL_MIN_DBM, dbm))
}

export function bestSignalDbm(
  distancesWithTier: { distanceMeters: number; txPowerTier: number; wallAttenuationDb?: number }[],
  band: Band,
): number {
  if (distancesWithTier.length === 0) return SIGNAL_MIN_DBM
  return Math.max(
    ...distancesWithTier.map((d) => estimateSignalDbm(d.distanceMeters, d.txPowerTier, band, d.wallAttenuationDb)),
  )
}

export interface RouterCandidate {
  id: string
  x: number
  y: number
  txPowerTier: number
}

export interface RouterConnection {
  routerId: string
  distanceMeters: number
  dbm: number
}

/** Picks the router a client would actually associate with: the strongest received signal. */
export function bestRouterConnection(
  point: { x: number; y: number },
  candidates: RouterCandidate[],
  walls: Wall[],
  pxPerMeter: number,
  band: Band,
  sensitivityBonusDb = 0,
): RouterConnection | null {
  let best: RouterConnection | null = null
  for (const candidate of candidates) {
    const distanceMeters = distanceInMeters(point, candidate, pxPerMeter)
    const wallDb = wallAttenuationBetween(point, candidate, walls, band)
    const dbm = estimateSignalDbm(distanceMeters, candidate.txPowerTier, band, wallDb) + sensitivityBonusDb
    if (!best || dbm > best.dbm) {
      best = { routerId: candidate.id, distanceMeters, dbm }
    }
  }
  return best
}

// Illustrative throughput estimate — not a real 802.11 PHY rate table, just a way to turn
// dBm + bandwidth + antenna count into a plausible-looking Mbps number for the client panel.
const RATE_MBPS_PER_MHZ_PER_STREAM = 6

export function estimateRateMbps(dbm: number, bandwidthMHz: number, streams: number): number {
  const maxRate = RATE_MBPS_PER_MHZ_PER_STREAM * bandwidthMHz * streams
  const strength = signalToStrength(dbm)
  return Math.max(1, Math.round(maxRate * strength * 10) / 10)
}

function segmentsIntersect(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number },
): boolean {
  const d1x = p2.x - p1.x
  const d1y = p2.y - p1.y
  const d2x = p4.x - p3.x
  const d2y = p4.y - p3.y
  const denom = d1x * d2y - d1y * d2x
  if (denom === 0) return false
  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denom
  const u = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / denom
  return t > 0 && t < 1 && u > 0 && u < 1
}

/** Sums the dB loss of every wall segment the straight line between a and b crosses. */
export function wallAttenuationBetween(
  a: { x: number; y: number },
  b: { x: number; y: number },
  walls: Wall[],
  band: Band,
): number {
  let total = 0
  for (const wall of walls) {
    const material = getWallMaterial(wall.materialId)
    if (!material) continue
    const dbForBand = material.dbAt5GHz * BAND_MATERIAL_SCALE[band]
    for (let i = 0; i < wall.points.length - 1; i++) {
      if (segmentsIntersect(a, b, wall.points[i], wall.points[i + 1])) {
        total += dbForBand
      }
    }
  }
  return total
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
