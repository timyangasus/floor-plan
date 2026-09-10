export interface WallMaterial {
  id: string
  name: string
  /** Swatch color shown in the picker — purely a UI hint, not sampled from the filter. */
  swatch: string
  /** CSS filter applied to the floor plan image — a cosmetic look only, no real wall data. */
  cssFilter: string
}

export const wallMaterials: WallMaterial[] = [
  { id: 'original', name: '原始圖片', swatch: '#e5e7eb', cssFilter: 'none' },
  { id: 'white-paint', name: '白色塗料', swatch: '#f5f5f4', cssFilter: 'saturate(0.35) brightness(1.1) contrast(0.95)' },
  { id: 'wood', name: '木紋', swatch: '#b98a5a', cssFilter: 'sepia(0.55) saturate(1.4) hue-rotate(-8deg) brightness(0.97)' },
  { id: 'concrete', name: '清水模', swatch: '#9ca3af', cssFilter: 'grayscale(0.85) brightness(0.95) contrast(1.08)' },
  { id: 'brick', name: '紅磚', swatch: '#b1502f', cssFilter: 'sepia(0.4) saturate(1.7) hue-rotate(-25deg) brightness(0.95)' },
  { id: 'dark', name: '深色系', swatch: '#3f3f46', cssFilter: 'brightness(0.55) contrast(1.15) saturate(0.9)' },
]

export function getWallMaterial(id: string | null): WallMaterial {
  return wallMaterials.find((m) => m.id === id) ?? wallMaterials[0]
}
