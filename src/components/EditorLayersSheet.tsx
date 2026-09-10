import { useNavigate } from 'react-router-dom'
import type { Floor } from '../types'
import './EditorChrome.css'

interface Props {
  floors: Floor[]
  currentFloorId: string
  projectId: string
  onClose: () => void
  onAddFloor: (file: File | null) => void
}

export default function EditorLayersSheet({ floors, currentFloorId, projectId, onClose, onAddFloor }: Props) {
  const navigate = useNavigate()

  function handleAddFloor() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/jpeg'
    input.onchange = () => {
      onAddFloor(input.files?.[0] ?? null)
    }
    input.click()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="catalog-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>樓層</h2>
          <button className="modal-close" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </div>
        <div className="catalog-list">
          {floors.map((floor) => (
            <button
              key={floor.id}
              className="catalog-row"
              onClick={() => {
                onClose()
                navigate(`/project/${projectId}/floor/${floor.id}`)
              }}
            >
              <span className="catalog-row-icon">⧉</span>
              <span className="catalog-row-name">{floor.name}</span>
              {floor.id === currentFloorId && <span className="catalog-row-badge">目前</span>}
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleAddFloor}>
            + 新增樓層
          </button>
        </div>
      </div>
    </div>
  )
}
