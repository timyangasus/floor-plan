import type { Band, MeshGroupLabel } from '../types'
import { getRouterModel } from '../data/routerCatalog'
import { classifyLinkQuality, distanceInMeters, estimateSignalDbm, linkQualityColor, linkQualityLabel } from '../lib/signalModel'
import type { ProjectDeviceEntry } from '../db/projectDevices'
import './MeshTopologyGraph.css'

interface Props {
  groupLabel: MeshGroupLabel
  members: ProjectDeviceEntry[]
  band: Band
  onSetCap: (deviceId: string) => void
}

const SIZE = 260
const CENTER = SIZE / 2
const RADIUS = 92

export default function MeshTopologyGraph({ groupLabel, members, band, onSetCap }: Props) {
  const cap = members.find((m) => m.device.isCap) ?? members[0]
  const rest = members.filter((m) => m.device.id !== cap?.device.id)

  function qualityFor(memberEntry: ProjectDeviceEntry): { dbm: number; sameFloor: boolean } | null {
    if (!cap) return null
    const capModel = getRouterModel(cap.device.modelId)
    if (!capModel) return null
    if (memberEntry.floor.id !== cap.floor.id || !cap.floor.scalePxPerMeter) {
      return { dbm: estimateSignalDbm(6, capModel.txPowerTier, band), sameFloor: false }
    }
    const distance = distanceInMeters(cap.device, memberEntry.device, cap.floor.scalePxPerMeter)
    return { dbm: estimateSignalDbm(distance, capModel.txPowerTier, band), sameFloor: true }
  }

  return (
    <div className="mesh-group-card">
      <div className="mesh-group-header">
        <span className="mesh-group-badge">Group {groupLabel}</span>
        <span className="mesh-group-count">{members.length} 台裝置</span>
      </div>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mesh-graph-svg">
        {rest.map((entry, i) => {
          const angle = (i / Math.max(1, rest.length)) * Math.PI * 2 - Math.PI / 2
          const x = CENTER + RADIUS * Math.cos(angle)
          const y = CENTER + RADIUS * Math.sin(angle)
          const q = qualityFor(entry)
          const quality = q ? classifyLinkQuality(q.dbm) : 'poor'
          return (
            <line
              key={entry.device.id}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke={linkQualityColor(quality)}
              strokeWidth={3}
            />
          )
        })}

        {cap && (
          <g>
            <circle cx={CENTER} cy={CENTER} r={22} fill="var(--accent)" />
            <text x={CENTER} y={CENTER + 4} textAnchor="middle" fontSize={11} fill="#fff">
              CAP
            </text>
          </g>
        )}

        {rest.map((entry, i) => {
          const angle = (i / Math.max(1, rest.length)) * Math.PI * 2 - Math.PI / 2
          const x = CENTER + RADIUS * Math.cos(angle)
          const y = CENTER + RADIUS * Math.sin(angle)
          return (
            <g key={entry.device.id}>
              <circle cx={x} cy={y} r={16} fill="var(--surface)" stroke="var(--border)" strokeWidth={1.5} />
              <text x={x} y={y + 4} textAnchor="middle" fontSize={13}>
                📶
              </text>
            </g>
          )
        })}
      </svg>

      <div className="mesh-member-list">
        {cap && (
          <div className="mesh-member-row mesh-member-cap">
            <span>{getRouterModel(cap.device.modelId)?.name ?? cap.device.modelId}</span>
            <span className="mesh-member-tag">CAP</span>
          </div>
        )}
        {rest.map((entry) => {
          const q = qualityFor(entry)
          const quality = q ? classifyLinkQuality(q.dbm) : 'poor'
          return (
            <div className="mesh-member-row" key={entry.device.id}>
              <span>{getRouterModel(entry.device.modelId)?.name ?? entry.device.modelId}</span>
              <span className="mesh-member-actions">
                <span className="mesh-quality-chip" style={{ color: linkQualityColor(quality) }}>
                  {linkQualityLabel(quality)}
                  {q && !q.sameFloor ? '（跨樓層估算）' : ''}
                </span>
                <button className="mesh-set-cap" onClick={() => onSetCap(entry.device.id)}>
                  設為 CAP
                </button>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
