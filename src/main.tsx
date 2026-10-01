import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { preventNativeZoom } from './lib/preventNativeZoom'

preventNativeZoom()

// A new deployed version's service worker activates in the background
// (skipWaiting + clientsClaim), but the already-open page keeps running on
// the old cached assets until something reloads it. Auto-reload once when
// that handoff happens, so a fresh deploy shows up the next time the app is
// opened instead of needing a manual force-refresh.
if ('serviceWorker' in navigator) {
  let reloadedForUpdate = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadedForUpdate) return
    reloadedForUpdate = true
    window.location.reload()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
