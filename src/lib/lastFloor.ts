const KEY = 'floor-plan:last-floor'

interface LastFloor {
  projectId: string
  floorId: string
}

export function saveLastFloor(projectId: string, floorId: string) {
  localStorage.setItem(KEY, JSON.stringify({ projectId, floorId }))
}

export function loadLastFloor(): LastFloor | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.projectId === 'string' && typeof parsed.floorId === 'string') {
      return parsed
    }
  } catch {
    // ignore malformed value
  }
  return null
}
