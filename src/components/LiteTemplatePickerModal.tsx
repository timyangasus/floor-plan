import { useState } from 'react'
import { LITE_TEMPLATES } from '../data/liteTemplates'
import LiteFloorPlanSvg from './LiteFloorPlanSvg'
import './LiteTemplatePickerModal.css'

interface Props {
  onClose: () => void
  onPick: (templateId: string, name?: string) => void
  withName?: boolean
  title?: string
  confirmLabel?: string
}

export default function LiteTemplatePickerModal({
  onClose,
  onPick,
  withName = true,
  title = '新增專案',
  confirmLabel = '建立',
}: Props) {
  const [name, setName] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function handleConfirm() {
    if (!selectedId) return
    onPick(selectedId, withName ? name.trim() || '我的家' : undefined)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </div>

        {withName && (
          <>
            <label className="modal-label">專案名稱</label>
            <input
              className="modal-input"
              placeholder="例如：我的家"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </>
        )}

        <label className="modal-label">選擇最接近的格局</label>
        <div className="lite-template-grid">
          {LITE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              className={`lite-template-card ${selectedId === t.id ? 'selected' : ''}`}
              onClick={() => setSelectedId(t.id)}
            >
              <div className="lite-template-preview">
                <LiteFloorPlanSvg template={t} showLabel={false} />
              </div>
              <span className="lite-template-label">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" disabled={!selectedId} onClick={handleConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
