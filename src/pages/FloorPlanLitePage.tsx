import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '../components/icons'
import './FloorPlanLitePage.css'

export default function FloorPlanLitePage() {
  const navigate = useNavigate()

  return (
    <div className="lite-page">
      <header className="lite-header">
        <button className="lite-back" onClick={() => navigate('/')} aria-label="返回 Router App 首頁">
          <ArrowLeftIcon />
        </button>
        <div className="lite-header-title">Floor Plan Lite</div>
      </header>

      <main className="lite-main">
        <p className="lite-placeholder">簡易版開發中，敬請期待。</p>
      </main>
    </div>
  )
}
