export function initViewportHeightFix() {
  const getHeight = () => window.visualViewport?.height ?? window.innerHeight
  let debounceId: ReturnType<typeof setTimeout> | null = null

  const setVh = () => {
    document.documentElement.style.setProperty('--app-vh', `${getHeight()}px`)
  }

  // Debounce reactive updates: a fixed-position sheet sliding in/out can
  // make visualViewport briefly report a smaller height mid-transition.
  // Waiting for things to go quiet before committing avoids locking in
  // that transient dip (which previously made the whole layout shrink
  // and everything anchored to the bottom appear to jump up).
  const scheduleSetVh = () => {
    if (debounceId) clearTimeout(debounceId)
    debounceId = setTimeout(setVh, 150)
  }

  setVh()
  window.visualViewport?.addEventListener('resize', scheduleSetVh)
  window.visualViewport?.addEventListener('scroll', scheduleSetVh)
  window.addEventListener('resize', scheduleSetVh)
  window.addEventListener('orientationchange', scheduleSetVh)
  window.addEventListener('pageshow', setVh)
  document.addEventListener('visibilitychange', setVh)
}
