export function preventNativeZoom() {
  const prevent: EventListener = (e) => e.preventDefault()
  const gestureEvents: string[] = ['gesturestart', 'gesturechange', 'gestureend']
  for (const type of gestureEvents) {
    document.addEventListener(type, prevent, { passive: false })
  }

  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1) e.preventDefault()
    },
    { passive: false },
  )
}
