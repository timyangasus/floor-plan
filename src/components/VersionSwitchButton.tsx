import { useNavigate } from 'react-router-dom'
import './VersionSwitchButton.css'

interface Props {
  liteMode: boolean
}

export default function VersionSwitchButton({ liteMode }: Props) {
  const navigate = useNavigate()
  const targetPath = liteMode ? '/home' : '/lite'
  const targetLabel = liteMode ? '完整版' : 'Lite'

  return (
    <button
      className="version-switch-btn"
      onClick={() => navigate(targetPath)}
      aria-label={`切換至${targetLabel}`}
      title={`切換至${targetLabel}`}
    >
      切至 {targetLabel}
    </button>
  )
}
