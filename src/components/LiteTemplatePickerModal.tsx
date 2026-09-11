import { useState } from 'react'
import { LITE_TEMPLATES } from '../data/liteTemplates'
import LiteFloorPlanSvg from './LiteFloorPlanSvg'
import './LiteTemplatePickerModal.css'

interface Props {
  onClose: () => void
  onCreate: (name: string, templateId: string) => void
}

export default function LiteTemplatePickerModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function handleCreate() {
    if (!selectedId) return
    onCreate(name.trim() || '我的家', selectedId)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>新增專案</h2>
          <button className="modal-close" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </div>

        <label className="modal-label">專案名稱</label>
        <input
          className="modal-input"
          placeholder="例如：我的家"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="modal-label">選擇最接近的格局</label>
        <div className="lite-template-grid">
          {LITE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              className={`lite-template-card ${selectedId === t.id ? 'selected' : ''}`}
              onClick={() => setSelectedId(t.id)}
            >
              <div className="lite-template-preview">
                <LiteFloorPlanSvg template={t} />
              </div>
              <span className="lite-template-label">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" disabled={!selectedId} onClick={handleCreate}>
            建立
          </button>
        </div>
      </div>
    </div>
  )
}
