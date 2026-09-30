const KEY = 'floor-plan:lite-default-seeded'
const CLIENT_TOPUP_KEY = 'floor-plan:lite-sample-client-topup'

/** Whether we've ever auto-created the first-time default Lite project. */
export function hasSeededLiteDefault(): boolean {
  return localStorage.getItem(KEY) === '1'
}

export function markLiteDefaultSeeded(): void {
  localStorage.setItem(KEY, '1')
}

/**
 * Whether we've already run the one-time top-up that adds a demo client to
 * installs whose sample project was seeded before that client existed.
 */
export function hasToppedUpSampleClient(): boolean {
  return localStorage.getItem(CLIENT_TOPUP_KEY) === '1'
}

export function markSampleClientToppedUp(): void {
  localStorage.setItem(CLIENT_TOPUP_KEY, '1')
}
