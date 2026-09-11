import type { CanvasMode } from './FloorCanvas2D'
import { SelectIcon, PanIcon, GridIcon, RouterIcon, WifiIcon, NetworkIcon } from './icons'
import './EditorChrome.css'

interface Props {
  mode: CanvasMode
  onModeChange: (m: CanvasMode) => void
  onOpenWallMaterial: () => void
  onAddClient: () => void
  onOpenTopology: () => void
  liteMode?: boolean
}

export default function EditorBottomToolbar({
  mode,
  onModeChange,
  onOpenWallMaterial,
  onAddClient,
  onOpenTopology,
  liteMode = false,
}: Props) {
  return (
    <div className="editor-bottom-toolbar">
      <button className={mode === 'select' ? 'active' : ''} onClick={() => onModeChange('select')} aria-label="選取">
        <SelectIcon />
      </button>
      <button className={mode === 'pan' ? 'active' : ''} onClick={() => onModeChange('pan')} aria-label="平移">
        <PanIcon />
      </button>
      {!liteMode && (
        <button
          className={mode === 'draw-wall' ? 'active' : ''}
          onClick={onOpenWallMaterial}
          aria-label="牆面材質"
        >
          <GridIcon />
        </button>
      )}
      <button className={mode === 'place' ? 'active' : ''} onClick={() => onModeChange('place')} aria-label="放置裝置">
        <RouterIcon />
      </button>
      <button onClick={onAddClient} aria-label="用戶端體驗">
        <WifiIcon />
      </button>
      {!liteMode && (
        <button onClick={onOpenTopology} aria-label="Mesh 拓撲">
          <NetworkIcon />
        </button>
      )}
    </div>
  )
}
