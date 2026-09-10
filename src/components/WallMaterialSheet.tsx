import { wallMaterials } from '../data/wallMaterials'
import './EditorChrome.css'

interface Props {
  currentMaterialId: string | null
  onClose: () => void
  onPick: (materialId: string | null) => void
}

export default function WallMaterialSheet({ currentMaterialId, onClose, onPick }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>牆面材質</h2>
          <button className="modal-close" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </div>
        <p className="modal-dropzone-hint">套用在平面圖上的視覺效果，僅影響顯示外觀。</p>

        <div className="material-grid">
          {wallMaterials.map((material) => {
            const isCurrent = (currentMaterialId ?? wallMaterials[0].id) === material.id
            return (
              <button
                key={material.id}
                className={`material-swatch-btn ${isCurrent ? 'active' : ''}`}
                onClick={() => onPick(material.id)}
              >
                <span className="material-swatch" style={{ background: material.swatch }} />
                <span>{material.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
