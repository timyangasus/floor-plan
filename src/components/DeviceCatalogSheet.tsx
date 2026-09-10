import { useMemo, useState } from 'react'
import { routerCatalog, routerSeriesList, wifiGenerationList } from '../data/routerCatalog'
import type { RouterModel } from '../types'
import { RouterIcon } from './icons'
import './EditorChrome.css'

interface Props {
  onClose: () => void
  onPick: (model: RouterModel) => void
}

export default function DeviceCatalogSheet({ onClose, onPick }: Props) {
  const [search, setSearch] = useState('')
  const [series, setSeries] = useState<RouterModel['series'] | null>(null)
  const [generation, setGeneration] = useState<RouterModel['generation'] | null>(null)

  const filtered = useMemo(() => {
    return routerCatalog.filter((m) => {
      if (series && m.series !== series) return false
      if (generation && m.generation !== generation) return false
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [search, series, generation])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="catalog-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>裝置</h2>
          <button className="modal-close" onClick={onClose} aria-label="關閉">
            ×
          </button>
        </div>

        <input
          className="modal-input"
          placeholder="搜尋裝置"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="chip-row">
          <span className="chip-row-title">系列</span>
          <div className="chip-list">
            {routerSeriesList.map((s) => (
              <button
                key={s}
                className={`chip ${series === s ? 'active' : ''}`}
                onClick={() => setSeries(series === s ? null : s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="chip-row">
          <span className="chip-row-title">WIFI</span>
          <div className="chip-list">
            {wifiGenerationList.map((g) => (
              <button
                key={g}
                className={`chip ${generation === g ? 'active' : ''}`}
                onClick={() => setGeneration(generation === g ? null : g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-list">
          {filtered.map((model) => (
            <button key={model.id} className="catalog-row" onClick={() => onPick(model)}>
              <span className="catalog-row-icon">
                <RouterIcon />
              </span>
              <span className="catalog-row-name">{model.name}</span>
              <span className="catalog-row-badge">{model.generation}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="modal-dropzone-hint">沒有符合的裝置。</p>}
        </div>
      </div>
    </div>
  )
}
