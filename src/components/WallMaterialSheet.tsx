import { useState } from 'react'
import { wallMaterials } from '../data/wallMaterials'
import './EditorChrome.css'

interface Props {
  onClose: () => void
  onPick: (materialId: string) => void
}

export default function WallMaterialSheet({ onClose, onPick }: Props) {
  const [drawMode, setDrawMode] = useState<'wall' | 'room'>('wall')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="catalog-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>選擇牆面材質</h2>
          <button className="modal-close" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </div>

        <div className="wall-mode-tabs">
          <button
            className={drawMode === 'wall' ? 'active' : ''}
            onClick={() => setDrawMode('wall')}
          >
            牆面
          </button>
          <button className="wall-mode-tab-disabled" disabled title="即將推出">
            房間
          </button>
        </div>

        <div className="catalog-list">
          {wallMaterials.map((material) => (
            <button key={material.id} className="catalog-row" onClick={() => onPick(material.id)}>
              <span className="wall-material-dot" style={{ background: material.color }} />
              <span className="catalog-row-name">{material.name}</span>
              <span className="catalog-row-badge">{material.dbAt5GHz} dB</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
