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
  /** Purely cosmetic look applied to the 2D floor plan image — see data/wallMaterials.ts */
  wallMaterialId: string | null
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
