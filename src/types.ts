export type WifiGeneration = 'WiFi 6' | 'WiFi 6E' | 'WiFi 7'

export type RouterSeries = 'ROG' | 'TUF' | 'ASUS' | 'ExpertWiFi' | 'ZenWiFi' | 'ProArt'

export interface RouterModel {
  id: string
  name: string
  series: RouterSeries
  generation: WifiGeneration
  /** Relative transmit-power tier used only for the simulated signal model (not a real spec). */
  txPowerTier: number
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface Floor {
  id: string
  projectId: string
  name: string
  order: number
  imageBlob: Blob | null
  /** pixels per meter, measured against the stored floor plan image's natural size */
  scalePxPerMeter: number | null
}

export type Band = '2.4' | '5' | '6'

export type MeshGroupLabel = 'A' | 'B' | 'C' | 'D' | 'E'

export interface Device {
  id: string
  floorId: string
  modelId: string
  x: number
  y: number
  rotation: number
  groupLabel: MeshGroupLabel | null
  isCap: boolean
}

export type LinkQuality = 'excellent' | 'good' | 'poor'

export interface Wall {
  id: string
  floorId: string
  /** Polyline vertices in the floor image's pixel space, in drawing order (>= 2 points). */
  points: { x: number; y: number }[]
  materialId: string
}

export interface TestClient {
  id: string
  floorId: string
  x: number
  y: number
  clientTypeId: string
  bandwidthMHz: 20 | 40 | 80 | 160
}
