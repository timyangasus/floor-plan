import { useState } from 'react'
import './EditorChrome.css'

interface Props {
  pixelDistance: number
  onCancel: () => void
  onConfirm: (meters: number) => void
}

export default function ScaleCalibrationModal({ pixelDistance, onCancel, onConfirm }: Props) {
  const [meters, setMeters] = useState('1')

  function handleConfirm() {
    const value = parseFloat(meters)
    if (!value || value <= 0) return
    onConfirm(value)
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>設定比例尺</h2>
          <button className="modal-close" onClick={onCancel} aria-label="關閉">
            ×
          </button>
        </div>
        <p className="modal-dropzone-hint">
          你剛剛標記的兩點，實際距離是多少公尺？（畫面距離約 {pixelDistance.toFixed(0)} px）
        </p>
        <label className="modal-label">實際距離（公尺）</label>
        <input
          className="modal-input"
          type="number"
          inputMode="decimal"
          min="0.1"
          step="0.1"
          value={meters}
          onChange={(e) => setMeters(e.target.value)}
        />
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            確認
          </button>
        </div>
      </div>
    </div>
  )
}
