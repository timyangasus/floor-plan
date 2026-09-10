import { useNavigate } from 'react-router-dom'
import type { ThemeMode } from '../lib/theme'
import { HomeIcon, NetworkIcon } from './icons'
import './EditorChrome.css'

interface Props {
  onClose: () => void
  projectId: string
  theme: ThemeMode
  onToggleTheme: () => void
}

export default function EditorMenuDrawer({ onClose, projectId, theme, onToggleTheme }: Props) {
  const navigate = useNavigate()

  return (
    <div className="modal-backdrop drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="home-header-title">
            <span className="home-logo">▲</span>
            <span>WiFi 平面圖規劃</span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </div>

        <button className="drawer-item" onClick={() => navigate('/home')}>
          <HomeIcon size={16} /> 專案列表
        </button>
        <button className="drawer-item" onClick={() => navigate(`/project/${projectId}/topology`)}>
          <NetworkIcon size={16} /> 拓撲
        </button>

        <div className="drawer-divider" />

        <button className="drawer-item" onClick={onToggleTheme}>
          {theme === 'dark' ? '🌙 深色' : theme === 'light' ? '☀️ 淺色' : '🌓 跟隨系統'}
        </button>
      </div>
    </div>
  )
}
