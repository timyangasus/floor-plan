import { useRef, useState } from 'react'
import './NewProjectModal.css'

interface Props {
  onClose: () => void
  onCreate: (name: string, image: File | null) => void
}

export default function NewProjectModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setImage(file)
  }

  function handleCreate() {
    const finalName = name.trim() || '我的家'
    onCreate(finalName, image)
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

        <label className="modal-label">平面圖檔案</label>
        <div className="modal-dropzone" onClick={() => fileRef.current?.click()}>
          {image ? (
            <span>{image.name}</span>
          ) : (
            <>
              <span>點擊選擇平面圖圖片</span>
              <span className="modal-dropzone-hint">PNG、JPEG（最大 5MB）</span>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          hidden
          onChange={handleFileChange}
        />

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={handleCreate}>
            建立
          </button>
        </div>
      </div>
    </div>
  )
}
