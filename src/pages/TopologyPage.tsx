import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProject } from '../db/repository'
import { listDevicesForProject, type ProjectDeviceEntry } from '../db/projectDevices'
import { assignDeviceGroup, setDeviceCap } from '../db/repository'
import type { Band, MeshGroupLabel, Project } from '../types'
import { getRouterModel } from '../data/routerCatalog'
import MeshTopologyGraph from '../components/MeshTopologyGraph'
import './TopologyPage.css'

const GROUP_LABELS: MeshGroupLabel[] = ['A', 'B', 'C', 'D', 'E']
const BANDS: Band[] = ['2.4', '5', '6']

export default function TopologyPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [entries, setEntries] = useState<ProjectDeviceEntry[]>([])
  const [band, setBand] = useState<Band>('2.4')

  useEffect(() => {
    load()
  }, [projectId])

  async function load() {
    if (!projectId) return
    const [p, list] = await Promise.all([getProject(projectId), listDevicesForProject(projectId)])
    setProject(p ?? null)
    setEntries(list)
  }

  const grouped = useMemo(() => {
    const map: Record<MeshGroupLabel, ProjectDeviceEntry[]> = { A: [], B: [], C: [], D: [], E: [] }
    for (const entry of entries) {
      if (entry.device.groupLabel) map[entry.device.groupLabel].push(entry)
    }
    return map
  }, [entries])

  const ungrouped = useMemo(() => entries.filter((e) => !e.device.groupLabel), [entries])

  async function handleAssignGroup(deviceId: string, groupLabel: MeshGroupLabel | null) {
    await assignDeviceGroup(deviceId, groupLabel)
    await load()
  }

  async function handleSetCap(deviceId: string) {
    await setDeviceCap(deviceId, true)
    await load()
  }

  const hasAnyGroup = GROUP_LABELS.some((g) => grouped[g].length > 0)

  return (
    <div className="topology-page">
      <header className="topology-header">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="返回">
          ←
        </button>
        <div className="topology-title">
          <h2>Mesh 拓撲</h2>
          <span>{project?.name}・回程等級・極佳 ≥ -67・良好 ≥ -77・不佳 &lt; -77 dBm</span>
        </div>
        <div className="band-tabs">
          {BANDS.map((b) => (
            <button key={b} className={b === band ? 'active' : ''} onClick={() => setBand(b)}>
              {b} GHz
            </button>
          ))}
        </div>
      </header>

      <main className="topology-main">
        {!hasAnyGroup && entries.length > 0 && (
          <div className="topology-empty">
            <div className="topology-empty-icon">⇄</div>
            <p>尚未設定任何 Mesh 群組。</p>
            <p className="topology-empty-hint">
              請把下方裝置指派到 A–E 其中一組、每組指定一台 CAP。
            </p>
          </div>
        )}

        {GROUP_LABELS.map(
          (label) =>
            grouped[label].length > 0 && (
              <MeshTopologyGraph
                key={label}
                groupLabel={label}
                members={grouped[label]}
                band={band}
                onSetCap={handleSetCap}
              />
            ),
        )}

        {ungrouped.length > 0 && (
          <div className="topology-ungrouped">
            <h3>未分組裝置</h3>
            {ungrouped.map((entry) => (
              <div className="ungrouped-row" key={entry.device.id}>
                <span>{getRouterModel(entry.device.modelId)?.name ?? entry.device.modelId}</span>
                <div className="group-picker">
                  {GROUP_LABELS.map((g) => (
                    <button key={g} onClick={() => handleAssignGroup(entry.device.id, g)}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {entries.length === 0 && (
          <p className="topology-empty-hint">這個專案還沒有放置任何路由器。</p>
        )}
      </main>
    </div>
  )
}
