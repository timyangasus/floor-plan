const KEY = 'floor-plan:full-default-seeded'

/** Whether we've ever auto-created the first-time default full-version project. */
export function hasSeededFullDefault(): boolean {
  return localStorage.getItem(KEY) === '1'
}

export function markFullDefaultSeeded(): void {
  localStorage.setItem(KEY, '1')
}
