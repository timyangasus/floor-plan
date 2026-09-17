import { useState } from 'react'
import { MonitorIcon, CopyIcon, CloseIcon } from './icons'
import './DesktopHintModal.css'

const DESKTOP_URL = 'https://floorplanlite.com'

interface Props {
  onClose: () => void
}

export default function DesktopHintModal({ onClose }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(DESKTOP_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the URL is
      // still visible in the field for the user to select and copy manually.
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet desktop-hint-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="desktop-hint-drag" />
        <button className="modal-close desktop-hint-close" onClick={onClose} aria-label="關閉">
          <CloseIcon size={20} />
        </button>

        <div className="desktop-hint-icon">
          <MonitorIcon size={26} />
        </div>
        <h2 className="desktop-hint-title">電腦版提供更多功能</h2>
        <p className="desktop-hint-desc">完整版提供更完整的格局編輯、尺寸標註、3D 預覽等進階功能。請使用電腦開啟 Web 版。</p>

        <div className="desktop-hint-url-row">
          <div className="desktop-hint-url">{DESKTOP_URL}</div>
          <button className="desktop-hint-copy" onClick={handleCopy}>
            <CopyIcon size={16} />
            {copied ? '已複製' : '複製網址'}
          </button>
        </div>

        <p className="desktop-hint-footnote">此功能僅提供於電腦瀏覽器使用，手機版僅支援簡易編輯。</p>
      </div>
    </div>
  )
}
