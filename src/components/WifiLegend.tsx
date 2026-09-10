import type { Band } from '../types'
import './EditorChrome.css'

interface Props {
  band: Band
  onBandChange: (b: Band) => void
}

const BANDS: Band[] = ['2.4', '5', '6']

export default function WifiLegend({ band, onBandChange }: Props) {
  return (
    <div className="wifi-legend">
      <div className="wifi-legend-header">
        <span>WiFi 覆蓋範圍（模擬估算）</span>
        <div className="band-tabs">
          {BANDS.map((b) => (
            <button key={b} className={b === band ? 'active' : ''} onClick={() => onBandChange(b)}>
              {b} GHz
            </button>
          ))}
        </div>
      </div>
      <div className="wifi-legend-bar" />
      <div className="wifi-legend-labels">
        <span>弱</span>
        <span>強</span>
      </div>
    </div>
  )
}
