import type { ViewMode } from '../pages/EditorPage.types'
import { EditIcon, LayersIcon } from './icons'
import './EditorChrome.css'

interface Props {
  onEditProject: () => void
  onLayers: () => void
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  liteMode?: boolean
}

export default function EditorTopBar({ onEditProject, onLayers, view, onViewChange, liteMode = false }: Props) {
  return (
    <div className="editor-topbar">
      <div className="editor-topbar-group">
        <button className="icon-btn" onClick={onEditProject} aria-label="專案設定">
          <EditIcon />
        </button>
        {!liteMode && (
          <button className="icon-btn" onClick={onLayers} aria-label="樓層">
            <LayersIcon />
          </button>
        )}
      </div>

      {!liteMode && (
        <div className="view-toggle">
          <button className={view === '2d' ? 'active' : ''} onClick={() => onViewChange('2d')}>
            2D
          </button>
          <button className={view === '3d' ? 'active' : ''} onClick={() => onViewChange('3d')}>
            3D
          </button>
        </div>
      )}
    </div>
  )
}
