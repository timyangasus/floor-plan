import { UndoIcon, RedoIcon, CenterIcon, ZoomInIcon, ZoomOutIcon } from './icons'
import './EditorChrome.css'

interface Props {
  onZoomIn: () => void
  onZoomOut: () => void
  onCenter: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

export default function EditorSideControls({
  onZoomIn,
  onZoomOut,
  onCenter,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: Props) {
  return (
    <div className="editor-side-controls">
      <div className="side-group">
        <button className="icon-btn" onClick={onUndo} disabled={!canUndo} aria-label="復原">
          <UndoIcon />
        </button>
        <button className="icon-btn" onClick={onRedo} disabled={!canRedo} aria-label="重做">
          <RedoIcon />
        </button>
      </div>
      <div className="side-group">
        <button className="icon-btn" onClick={onCenter} aria-label="置中">
          <CenterIcon />
        </button>
        <button className="icon-btn" onClick={onZoomIn} aria-label="放大">
          <ZoomInIcon />
        </button>
        <button className="icon-btn" onClick={onZoomOut} aria-label="縮小">
          <ZoomOutIcon />
        </button>
      </div>
    </div>
  )
}
