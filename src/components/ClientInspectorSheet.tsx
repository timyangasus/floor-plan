import { clientTypes, getClientType, bandwidthOptions } from '../data/clientTypes'
import { classifyLinkQuality, linkQualityColor, linkQualityLabel, signalToStrength } from '../lib/signalModel'
import { TrashIcon, CloseIcon } from './icons'
import type { TestClient } from '../types'
import './EditorChrome.css'

interface ConnectionInfo {
  routerName: string
  floorName: string
  distanceMeters: number
  dbm: number
  rateMbps: number
  mimo: number
}

interface Props {
  client: TestClient
  connection: ConnectionInfo | null
  onClose: () => void
  onDelete: () => void
  onChangeType: (clientTypeId: string) => void
  onChangeBandwidth: (bandwidthMHz: 20 | 40 | 80 | 160) => void
}

export default function ClientInspectorSheet({
  client,
  connection,
  onClose,
  onDelete,
  onChangeType,
  onChangeBandwidth,
}: Props) {
  const currentType = getClientType(client.clientTypeId)
  const quality = connection ? classifyLinkQuality(connection.dbm) : null
  const strength = connection ? signalToStrength(connection.dbm) : 0

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>編輯用戶端</h2>
          <div className="modal-header-actions">
            <button className="modal-close" onClick={onDelete} aria-label="刪除">
              <TrashIcon size={18} />
            </button>
            <button className="modal-close" onClick={onClose} aria-label="關閉">
              <CloseIcon size={18} />
            </button>
          </div>
        </div>

        <label className="modal-label">類型</label>
        <select
          className="modal-input"
          value={client.clientTypeId}
          onChange={(e) => onChangeType(e.target.value)}
        >
          {clientTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <label className="modal-label">頻寬</label>
        <select
          className="modal-input"
          value={client.bandwidthMHz}
          onChange={(e) => onChangeBandwidth(Number(e.target.value) as 20 | 40 | 80 | 160)}
        >
          {bandwidthOptions.map((bw) => (
            <option key={bw} value={bw}>
              {bw} MHz
            </option>
          ))}
        </select>

        <div className="drawer-divider" />

        <label className="modal-label">連線</label>
        {connection ? (
          <>
            <div className="client-connection-row">
              <span>{connection.routerName}</span>
              <span className="client-connection-floor">{connection.floorName}</span>
            </div>
            <div className="client-connection-row">
              <strong>{connection.dbm.toFixed(1)} dBm</strong>
              {quality && (
                <span className="client-quality-badge" style={{ background: linkQualityColor(quality) }}>
                  {linkQualityLabel(quality)}
                </span>
              )}
            </div>
            <div className="client-signal-bar">
              <div className="client-signal-marker" style={{ left: `${strength * 100}%` }} />
            </div>
            <div className="wifi-legend-labels">
              <span>弱</span>
              <span>強</span>
            </div>

            <div className="client-connection-row" style={{ marginTop: 14 }}>
              <span>傳輸速率（{currentType.mimo}×{currentType.mimo}）</span>
              <strong>{connection.rateMbps.toFixed(2)} Mbps</strong>
            </div>
            <div className="client-signal-bar client-rate-bar">
              <div
                className="client-signal-marker"
                style={{ left: `${Math.min(100, (connection.rateMbps / 240) * 100)}%` }}
              />
            </div>
            <div className="wifi-legend-labels">
              <span>0</span>
              <span>240 Mbps</span>
            </div>
          </>
        ) : (
          <p className="modal-dropzone-hint">附近沒有偵測到任何路由器。</p>
        )}
      </div>
    </div>
  )
}
