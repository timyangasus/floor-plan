export interface WallMaterial {
  id: string
  name: string
  /** Attenuation in dB at 5GHz, as labeled in the reference app; other bands scale from this. */
  dbAt5GHz: number
  color: string
}

export const wallMaterials: WallMaterial[] = [
  { id: 'concrete', name: '混凝土', dbAt5GHz: 15, color: '#57c787' },
  { id: 'light-partition-standard', name: '輕隔間（標準）', dbAt5GHz: 3, color: '#3b7dff' },
  { id: 'light-partition-reinforced', name: '輕隔間（加強）', dbAt5GHz: 4, color: '#43db87' },
  { id: 'glass-standard', name: '玻璃（標準）', dbAt5GHz: 2, color: '#5cd4ff' },
  { id: 'glass-thin', name: '玻璃（薄）', dbAt5GHz: 1, color: '#5cd2ff' },
  { id: 'brick', name: '磚牆', dbAt5GHz: 5, color: '#ff341f' },
  { id: 'metal', name: '金屬', dbAt5GHz: 10, color: '#9aadc1' },
  { id: 'wood-board', name: '木板', dbAt5GHz: 5, color: '#f99525' },
  { id: 'door-wood', name: '門（木質）', dbAt5GHz: 5, color: '#fdac3c' },
  { id: 'door-metal', name: '門（金屬）', dbAt5GHz: 10, color: '#9aadc1' },
  { id: 'door-glass', name: '門（玻璃）', dbAt5GHz: 2, color: '#5cd4ff' },
  { id: 'window-single', name: '窗（單層玻璃）', dbAt5GHz: 4, color: '#5ed2fd' },
  { id: 'window-double', name: '窗（雙層玻璃）', dbAt5GHz: 7, color: '#4fc4f8' },
  { id: 'window-triple', name: '窗（三層玻璃）', dbAt5GHz: 10, color: '#2ab3f3' },
]

export function getWallMaterial(id: string): WallMaterial | undefined {
  return wallMaterials.find((m) => m.id === id)
}
