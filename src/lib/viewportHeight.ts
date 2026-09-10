export function initViewportHeightFix() {
  const getHeight = () => window.visualViewport?.height ?? window.innerHeight

  const setVh = () => {
    document.documentElement.style.setProperty('--app-vh', `${getHeight()}px`)
  }

  setVh()
  window.visualViewport?.addEventListener('resize', setVh)
  window.visualViewport?.addEventListener('scroll', setVh)
  window.addEventListener('resize', setVh)
  window.addEventListener('orientationchange', setVh)
  window.addEventListener('pageshow', setVh)
  document.addEventListener('visibilitychange', setVh)

  // iOS sometimes reports a shorter viewport right after launch, before its
  // chrome finishes collapsing — a scroll later reveals the real height.
  // Re-measure a few times shortly after load so the bar settles without
  // needing the user to scroll first.
  for (const delay of [50, 150, 300, 600, 1000, 2000]) {
    setTimeout(setVh, delay)
  }
  requestAnimationFrame(setVh)
}
