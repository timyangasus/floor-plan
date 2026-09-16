const KEY = 'floor-plan:lite-default-seeded'

/** Whether we've ever auto-created the first-time default Lite project. */
export function hasSeededLiteDefault(): boolean {
  return localStorage.getItem(KEY) === '1'
}

export function markLiteDefaultSeeded(): void {
  localStorage.setItem(KEY, '1')
}
