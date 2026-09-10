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
          ↶
        </button>
        <button className="icon-btn" onClick={onRedo} disabled={!canRedo} aria-label="重做">
          ↷
        </button>
      </div>
      <div className="side-group">
        <button className="icon-btn" onClick={onCenter} aria-label="置中">
          ⊹
        </button>
        <button className="icon-btn" onClick={onZoomIn} aria-label="放大">
          +
        </button>
        <button className="icon-btn" onClick={onZoomOut} aria-label="縮小">
          −
        </button>
      </div>
    </div>
  )
}
