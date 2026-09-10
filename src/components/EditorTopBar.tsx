import type { ViewMode } from '../pages/EditorPage.types'
import { MenuIcon, EditIcon, LayersIcon } from './icons'
import './EditorChrome.css'

interface Props {
  onMenu: () => void
  onEditProject: () => void
  onLayers: () => void
  view: ViewMode
  onViewChange: (v: ViewMode) => void
}

export default function EditorTopBar({ onMenu, onEditProject, onLayers, view, onViewChange }: Props) {
  return (
    <div className="editor-topbar">
      <div className="editor-topbar-group">
        <button className="icon-btn" onClick={onMenu} aria-label="選單">
          <MenuIcon />
        </button>
        <button className="icon-btn" onClick={onEditProject} aria-label="專案設定">
          <EditIcon />
        </button>
        <button className="icon-btn" onClick={onLayers} aria-label="樓層">
          <LayersIcon />
        </button>
      </div>
      <div className="view-toggle">
        <button className={view === '2d' ? 'active' : ''} onClick={() => onViewChange('2d')}>
          2D
        </button>
        <button className={view === '3d' ? 'active' : ''} onClick={() => onViewChange('3d')}>
          3D
        </button>
      </div>
    </div>
  )
}
