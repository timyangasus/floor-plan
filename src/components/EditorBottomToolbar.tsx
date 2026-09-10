import type { CanvasMode } from './FloorCanvas2D'
import { SelectIcon, PanIcon, GridIcon, RouterIcon, WifiIcon, NetworkIcon } from './icons'
import './EditorChrome.css'

interface Props {
  mode: CanvasMode
  onModeChange: (m: CanvasMode) => void
  showGrid: boolean
  onToggleGrid: () => void
  showHeatmap: boolean
  onToggleHeatmap: () => void
  onOpenTopology: () => void
}

export default function EditorBottomToolbar({
  mode,
  onModeChange,
  showGrid,
  onToggleGrid,
  showHeatmap,
  onToggleHeatmap,
  onOpenTopology,
}: Props) {
  return (
    <div className="editor-bottom-toolbar">
      <button className={mode === 'select' ? 'active' : ''} onClick={() => onModeChange('select')} aria-label="選取">
        <SelectIcon />
      </button>
      <button className={mode === 'pan' ? 'active' : ''} onClick={() => onModeChange('pan')} aria-label="平移">
        <PanIcon />
      </button>
      <button className={showGrid ? 'active' : ''} onClick={onToggleGrid} aria-label="格線">
        <GridIcon />
      </button>
      <button className={mode === 'place' ? 'active' : ''} onClick={() => onModeChange('place')} aria-label="放置裝置">
        <RouterIcon />
      </button>
      <button className={showHeatmap ? 'active' : ''} onClick={onToggleHeatmap} aria-label="WiFi 熱區">
        <WifiIcon />
      </button>
      <button onClick={onOpenTopology} aria-label="Mesh 拓撲">
        <NetworkIcon />
      </button>
    </div>
  )
}
