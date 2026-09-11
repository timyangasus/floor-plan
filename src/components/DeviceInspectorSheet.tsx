import { useState } from 'react'
import type { Band, Device, MeshGroupLabel, RouterModel } from '../types'
import { getChainSpec, getSupportedBands } from '../data/routerCatalog'
import { RouterIcon, TrashIcon, CloseIcon } from './icons'
import AntennaPatternChart from './AntennaPatternChart'
import './EditorChrome.css'

const GROUP_LABELS: MeshGroupLabel[] = ['A', 'B', 'C', 'D', 'E']

interface Props {
  device: Device
  model: RouterModel | null | undefined
  onClose: () => void
  onDelete: () => void
  onRename: (name: string) => void
  onChangeHeight: (heightMeters: number) => void
  onChangeGroup: (groupLabel: MeshGroupLabel | null) => void
  onChangeCap: (isCap: boolean) => void
  hideMesh?: boolean
}

export default function DeviceInspectorSheet({
  device,
  model,
  onClose,
  onDelete,
  onRename,
  onChangeHeight,
  onChangeGroup,
  onChangeCap,
  hideMesh = false,
}: Props) {
  const fallbackName = model?.name ?? device.modelId
  const [name, setName] = useState(device.name ?? fallbackName)
  const supportedBands = model ? getSupportedBands(model) : (['2.4', '5', '6'] as Band[])
  const [band, setBand] = useState<Band>(supportedBands[0])
  const heightMeters = device.heightMeters ?? 0

  function commitName() {
    onRename(name.trim() || fallbackName)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>編輯裝置</h2>
          <div className="modal-header-actions">
            <button className="modal-close" onClick={onDelete} aria-label="刪除">
              <TrashIcon size={18} />
            </button>
            <button className="modal-close" onClick={onClose} aria-label="關閉">
              <CloseIcon size={18} />
            </button>
          </div>
        </div>

        <label className="modal-label">名稱</label>
        <input
          className="modal-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
        />

        <label className="modal-label">型號</label>
        <div className="modal-input device-model-display">{fallbackName}</div>
        {model && (
          <div className="device-model-spec">
            <RouterIcon size={20} />
            <span>
              {model.generation} · {getChainSpec(model)}
            </span>
          </div>
        )}

        <label className="modal-label">高度（公尺）</label>
        <div className="device-height-row">
          <input
            type="range"
            min={0}
            max={6}
            step={0.1}
            value={heightMeters}
            onChange={(e) => onChangeHeight(Number(e.target.value))}
          />
          <input
            type="number"
            className="modal-input device-height-number"
            min={0}
            max={6}
            step={0.1}
            value={heightMeters}
            onChange={(e) => onChangeHeight(Number(e.target.value))}
          />
        </div>

        {!hideMesh && (
          <>
            <label className="modal-label">Mesh 群組</label>
            <div className="device-mesh-row">
              <select
                className="modal-input"
                value={device.groupLabel ?? ''}
                onChange={(e) => onChangeGroup(e.target.value ? (e.target.value as MeshGroupLabel) : null)}
              >
                <option value="">無</option>
                {GROUP_LABELS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <select
                className="modal-input"
                disabled={!device.groupLabel}
                value={device.isCap ? 'CAP' : ''}
                onChange={(e) => onChangeCap(e.target.value === 'CAP')}
              >
                <option value="">角色…</option>
                <option value="CAP">CAP</option>
              </select>
            </div>
            <p className="modal-dropzone-hint">CAP 為主節點，每組只能有一個。</p>
          </>
        )}

        <div className="drawer-divider" />

        <label className="modal-label">天線輻射場型</label>
        <div className="band-tabs antenna-band-tabs">
          {supportedBands.map((b) => (
            <button key={b} className={b === band ? 'active' : ''} onClick={() => setBand(b)}>
              {b} GHz
            </button>
          ))}
        </div>
        <div className="antenna-chart-row">
          <AntennaPatternChart seedKey={`${device.id}-${band}-az`} label="方位角（仰角 90°）" />
          <AntennaPatternChart seedKey={`${device.id}-${band}-el`} label="仰角（方位角 0°）" />
        </div>
      </div>
    </div>
  )
}
