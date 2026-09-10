import { useState } from 'react'
import './EditorChrome.css'

interface Props {
  initialName: string
  onClose: () => void
  onSave: (name: string) => void
}

export default function ProjectSettingsModal({ initialName, onClose, onSave }: Props) {
  const [name, setName] = useState(initialName)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>專案設定</h2>
          <button className="modal-close" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </div>
        <label className="modal-label">專案名稱</label>
        <input className="modal-input" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onSave(name.trim() || initialName)
              onClose()
            }}
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  )
}
