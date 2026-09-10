import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GridIcon, NetworkIcon, HelpIcon } from './icons'
import type { ThemeMode } from '../lib/theme'
import './AppSideNav.css'

interface Props {
  projectId?: string
  theme: ThemeMode
  onToggleTheme: () => void
}

export default function AppSideNav({ projectId, theme, onToggleTheme }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const [showAbout, setShowAbout] = useState(false)

  const onTopology = location.pathname.endsWith('/topology')
  const onFloorplan = !onTopology

  return (
    <>
      <nav className="app-side-nav">
        <div className="app-side-nav-top">
          <span className="app-side-nav-logo">▲</span>
          <button
            className={`app-side-nav-btn ${onFloorplan ? 'active' : ''}`}
            onClick={() => navigate('/home')}
            aria-label="平面圖規劃"
          >
            <GridIcon />
          </button>
          <button
            className={`app-side-nav-btn ${onTopology ? 'active' : ''}`}
            onClick={() => projectId && navigate(`/project/${projectId}/topology`)}
            disabled={!projectId}
            aria-label="Mesh 拓撲"
          >
            <NetworkIcon />
          </button>
        </div>

        <div className="app-side-nav-bottom">
          <button className="app-side-nav-btn" onClick={onToggleTheme} aria-label="切換主題">
            {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌓'}
          </button>
          <button className="app-side-nav-btn" onClick={() => setShowAbout(true)} aria-label="說明">
            <HelpIcon />
          </button>
          <span className="app-side-nav-lang">繁中</span>
          <span className="app-side-nav-avatar">A</span>
        </div>
      </nav>

      {showAbout && (
        <div className="modal-backdrop" onClick={() => setShowAbout(false)}>
          <div className="app-side-nav-about" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="home-header-title">
                <span className="home-logo">▲</span>
                <span>WiFi 平面圖規劃</span>
              </div>
              <button className="modal-close" onClick={() => setShowAbout(false)} aria-label="關閉">
                ×
              </button>
            </div>
            <p className="app-side-nav-about-text">
              參考 ASUS WiFi Floorplan 製作的示範應用，所有資料皆儲存於本機裝置，無需登入、可離線使用。
            </p>
          </div>
        </div>
      )}
    </>
  )
}
