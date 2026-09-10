export interface WallMaterial {
  id: string
  name: string
  /** Attenuation in dB at 5GHz, as labeled in the reference app; other bands scale from this. */
  dbAt5GHz: number
  color: string
}

export const wallMaterials: WallMaterial[] = [
  { id: 'concrete', name: '混凝土', dbAt5GHz: 15, color: '#3f6b52' },
  { id: 'light-partition-standard', name: '輕隔間（標準）', dbAt5GHz: 3, color: '#3b6fd6' },
  { id: 'light-partition-reinforced', name: '輕隔間（加強）', dbAt5GHz: 4, color: '#2f6b4a' },
  { id: 'glass-standard', name: '玻璃（標準）', dbAt5GHz: 2, color: '#60c4e8' },
  { id: 'glass-thin', name: '玻璃（薄）', dbAt5GHz: 1, color: '#a7dcf0' },
  { id: 'brick', name: '磚牆', dbAt5GHz: 5, color: '#c0392b' },
  { id: 'metal', name: '金屬', dbAt5GHz: 10, color: '#9aa0a6' },
  { id: 'wood-board', name: '木板', dbAt5GHz: 5, color: '#b5762f' },
  { id: 'door-wood', name: '門（木質）', dbAt5GHz: 5, color: '#d1943f' },
  { id: 'door-metal', name: '門（金屬）', dbAt5GHz: 10, color: '#9aa0a6' },
  { id: 'door-glass', name: '門（玻璃）', dbAt5GHz: 2, color: '#60c4e8' },
  { id: 'window-single', name: '窗（單層玻璃）', dbAt5GHz: 4, color: '#7fc6e0' },
  { id: 'window-double', name: '窗（雙層玻璃）', dbAt5GHz: 7, color: '#4fa8cf' },
  { id: 'window-triple', name: '窗（三層玻璃）', dbAt5GHz: 10, color: '#2f7ea3' },
]

export function getWallMaterial(id: string): WallMaterial | undefined {
  return wallMaterials.find((m) => m.id === id)
}
