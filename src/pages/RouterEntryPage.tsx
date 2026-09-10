import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './RouterEntryPage.css'

interface MoreItem {
  key: string
  label: string
  sub?: string
  highlight?: boolean
}

const MORE_ITEMS: MoreItem[] = [
  { key: 'app-settings', label: '應用程式設定', sub: '主題, Face ID & 密碼, 語言選項...' },
  { key: 'floor-plan', label: 'Floor Plan', highlight: true },
  { key: 'about', label: '關於' },
  { key: 'support', label: '華碩支援' },
  { key: 'insight', label: '軟體洞察' },
  { key: 'faq', label: '常見問題' },
  { key: 'report', label: '問題回報' },
  { key: 'webgui', label: '進入 Web GUI' },
]

export default function RouterEntryPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  function handleMoreClick(key: string) {
    if (key === 'floor-plan') {
      navigate('/home')
      return
    }
    setDrawerOpen(false)
  }

  return (
    <div className="re-page">
      <header className="re-header">
        <button className="re-avatar" onClick={() => setDrawerOpen(true)} aria-label="開啟選單">
          <GoogleGlyph />
        </button>
        <div className="re-header-title">首頁</div>
        <div className="re-header-actions">
          <span className="re-icon-btn">
            <InfoGlyph />
          </span>
          <span className="re-icon-btn">
            <BellGlyph />
          </span>
        </div>
      </header>

      <main className="re-main">
        <div className="re-status-card">
          <div className="re-status-icon">
            <RouterGlyph />
          </div>
          <div className="re-status-text">
            <div className="re-status-name">ZenWiFi BT8</div>
            <div className="re-status-row">
              區域網路 IP <span className="re-status-value">192.168.50.1</span>
            </div>
            <div className="re-status-row">
              無線網路名稱 <span className="re-status-value">timmmbt8</span>
            </div>
          </div>
          <span className="re-icon-btn re-speed">
            <SpeedGlyph />
          </span>
        </div>

        <div className="re-ssid-block">
          <div className="re-ssid-label">無線網路名稱</div>
          <div className="re-ssid-icon">
            <WifiGlyph />
          </div>
          <div className="re-band-row">
            <span className="re-band-chip">2.4</span>
            <span className="re-band-chip">5</span>
            <span className="re-band-chip">6</span>
          </div>
          <div className="re-action-row">
            <span className="re-icon-btn">
              <GlobeGlyph />
            </span>
            <span className="re-icon-btn">
              <HomeGlyph />
            </span>
            <span className="re-icon-btn">
              <WifiSmallGlyph />
            </span>
          </div>
        </div>
      </main>

      <nav className="re-tabbar">
        <div className="re-tab re-tab-active">
          <HomeGlyph />
          <span>首頁</span>
        </div>
        <div className="re-tab">
          <DevicesGlyph />
          <span>裝置</span>
        </div>
        <div className="re-tab">
          <SparkleGlyph />
          <span>AI</span>
        </div>
        <div className="re-tab">
          <FamilyGlyph />
          <span>家庭</span>
        </div>
        <div className="re-tab">
          <GearGlyph />
          <span>設定</span>
        </div>
      </nav>

      {drawerOpen && (
        <div className="re-drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="re-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="re-drawer-account">
              <span className="re-drawer-avatar">
                <GoogleGlyph />
              </span>
              <div>
                <div className="re-drawer-account-name">Google</div>
                <div className="re-drawer-account-email">demo@gmail.com</div>
              </div>
              <span className="re-drawer-chev">
                <ChevronGlyph />
              </span>
            </div>

            <div className="re-drawer-device">
              <span className="re-drawer-device-icon">
                <RouterGlyph />
              </span>
              <div>
                <div className="re-drawer-device-name">ZenWiFi BT8</div>
                <div className="re-drawer-device-sub">住家</div>
              </div>
              <span className="re-drawer-chev">
                <ChevronGlyph />
              </span>
            </div>

            <div className="re-drawer-section-label">更多</div>

            {MORE_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`re-drawer-row ${item.highlight ? 're-drawer-row-highlight' : ''}`}
                onClick={() => handleMoreClick(item.key)}
              >
                <span className="re-drawer-row-icon">
                  <MoreIcon itemKey={item.key} />
                </span>
                <span className="re-drawer-row-text">
                  <span className="re-drawer-row-label">{item.label}</span>
                  {item.sub && <span className="re-drawer-row-sub">{item.sub}</span>}
                </span>
                <span className="re-drawer-chev">
                  <ChevronGlyph />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MoreIcon({ itemKey }: { itemKey: string }) {
  switch (itemKey) {
    case 'app-settings':
      return <GearGlyph />
    case 'floor-plan':
      return <FloorPlanGlyph />
    case 'about':
      return <InfoGlyph />
    case 'support':
      return <SupportGlyph />
    case 'insight':
      return <InsightGlyph />
    case 'faq':
      return <FaqGlyph />
    case 'report':
      return <ReportGlyph />
    case 'webgui':
      return <ExternalLinkGlyph />
    default:
      return null
  }
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path
        fill="#4285F4"
        d="M22.5 12.23c0-.82-.07-1.42-.22-2.05H12v3.72h6.02c-.12 1-.78 2.51-2.24 3.53l-.02.14 3.25 2.52.23.02c2.07-1.9 3.26-4.7 3.26-7.88z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.94 0 5.4-.96 7.2-2.6l-3.43-2.65c-.92.63-2.15 1.07-3.77 1.07-2.88 0-5.32-1.9-6.19-4.53l-.13.01-3.38 2.62-.04.12C4.24 20.55 7.81 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.81 14.29A6.9 6.9 0 015.44 12c0-.8.14-1.57.36-2.29l-.01-.15L2.37 6.9l-.11.05A11 11 0 001 12c0 1.77.43 3.45 1.26 4.94l3.55-2.65z"
      />
      <path
        fill="#EA4335"
        d="M12 5.18c2.05 0 3.43.88 4.22 1.62l3.08-3A10.6 10.6 0 0012 1C7.81 1 4.24 3.45 2.26 6.95l3.55 2.76C6.68 7.08 9.12 5.18 12 5.18z"
      />
    </svg>
  )
}

function InfoGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
    </svg>
  )
}

function BellGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}

function RouterGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="7" rx="2" />
      <circle cx="8" cy="14.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M8 11V8" />
      <path d="M5 6a5 5 0 0110 0" />
    </svg>
  )
}

function SpeedGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 12l4-4" />
      <path d="M8 12a4 4 0 018 0" />
    </svg>
  )
}

function WifiGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M2 8.82a15 15 0 0120 0" />
      <path d="M5 12.86a10 10 0 0114 0" />
      <path d="M8.5 16.9a5 5 0 017 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2.4" />
    </svg>
  )
}

function GlobeGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
}

function HomeGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  )
}

function WifiSmallGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 12.55a11 11 0 0114.08 0" />
      <path d="M1.42 9a16 16 0 0121.16 0" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function DevicesGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="12" height="16" rx="2" />
      <rect x="15" y="11" width="6" height="9" rx="1.5" />
    </svg>
  )
}

function SparkleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none">
      <path d="M12 2l1.8 5.6L19 9.5l-5.2 1.9L12 17l-1.8-5.6L5 9.5l5.2-1.9z" />
    </svg>
  )
}

function FamilyGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 21v-2a5 5 0 015-5h2a5 5 0 015 5v2" />
      <circle cx="18" cy="9" r="2.2" />
      <path d="M22 21v-1.6a4 4 0 00-3-3.9" />
    </svg>
  )
}

function GearGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}

function FloorPlanGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="9" x2="9" y2="21" />
    </svg>
  )
}

function SupportGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
  )
}

function InsightGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )
}

function FaqGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
    </svg>
  )
}

function ReportGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

function ExternalLinkGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function ChevronGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
