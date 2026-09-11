import { generateAntennaPatternPoints } from '../lib/antennaPattern'

interface Props {
  seedKey: string
  label: string
}

const SIZE = 120
const CENTER = SIZE / 2
const MAX_R = SIZE / 2 - 4
const RINGS = [0.25, 0.5, 0.75, 1]
const SPOKES = 8

export default function AntennaPatternChart({ seedKey, label }: Props) {
  const points = generateAntennaPatternPoints(seedKey)
  const polygonPoints = points
    .map((p) => `${CENTER + p.x * MAX_R},${CENTER + p.y * MAX_R}`)
    .join(' ')

  return (
    <div className="antenna-chart">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
        <g stroke="var(--border)" strokeWidth={1} fill="none">
          {RINGS.map((r) => (
            <circle key={r} cx={CENTER} cy={CENTER} r={r * MAX_R} />
          ))}
          {Array.from({ length: SPOKES }).map((_, i) => {
            const a = (i / SPOKES) * Math.PI * 2
            return (
              <line
                key={i}
                x1={CENTER}
                y1={CENTER}
                x2={CENTER + Math.cos(a) * MAX_R}
                y2={CENTER + Math.sin(a) * MAX_R}
              />
            )
          })}
        </g>
        <polygon
          points={polygonPoints}
          fill="rgba(26, 86, 219, 0.15)"
          stroke="var(--accent)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>
      <span className="antenna-chart-label">{label}</span>
    </div>
  )
}
