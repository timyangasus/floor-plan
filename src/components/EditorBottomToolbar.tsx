import type { CanvasMode } from './FloorCanvas2D'
import './EditorChrome.css'

interface Props {
  mode: CanvasMode
  onModeChange: (m: CanvasMode) => void
  showHeatmap: boolean
  onToggleHeatmap: () => void
  onOpenTopology: () => void
}

export default function EditorBottomToolbar({
  mode,
  onModeChange,
  showHeatmap,
  onToggleHeatmap,
  onOpenTopology,
}: Props) {
  return (
    <div className="editor-bottom-toolbar">
      <button className={mode === 'select' ? 'active' : ''} onClick={() => onModeChange('select')} aria-label="選取">
        ↖
      </button>
      <button className={mode === 'pan' ? 'active' : ''} onClick={() => onModeChange('pan')} aria-label="平移">
        ✥
      </button>
      <button className={mode === 'place' ? 'active' : ''} onClick={() => onModeChange('place')} aria-label="放置裝置">
        📶
      </button>
      <button className={showHeatmap ? 'active' : ''} onClick={onToggleHeatmap} aria-label="WiFi 熱區">
        ((•))
      </button>
      <button onClick={onOpenTopology} aria-label="Mesh 拓撲">
        ⇄
      </button>
    </div>
  )
}
