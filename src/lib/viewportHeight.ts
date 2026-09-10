export function initViewportHeightFix() {
  const setVh = () => {
    document.documentElement.style.setProperty('--app-vh', `${window.innerHeight}px`)
  }
  setVh()
  window.addEventListener('resize', setVh)
  window.addEventListener('orientationchange', setVh)
  window.visualViewport?.addEventListener('resize', setVh)
  requestAnimationFrame(setVh)
}
