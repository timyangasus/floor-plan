import type { LiteTemplate } from '../data/liteTemplates'
import { LITE_PX_PER_METER } from '../data/liteTemplates'

interface Props {
  template: LiteTemplate
  className?: string
}

export default function LiteFloorPlanSvg({ template, className }: Props) {
  const w = template.widthMeters * LITE_PX_PER_METER
  const h = template.depthMeters * LITE_PX_PER_METER
  const strokeWidth = Math.max(4, Math.round(Math.min(w, h) * 0.012))

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = []

  for (let c = 1; c < template.cols; c++) {
    const x = (w / template.cols) * c
    const gap = h * 0.16
    lines.push({ x1: x, y1: 0, x2: x, y2: h / 2 - gap / 2 })
    lines.push({ x1: x, y1: h / 2 + gap / 2, x2: x, y2: h })
  }

  for (let r = 1; r < template.rows; r++) {
    const y = (h / template.rows) * r
    const gap = w * 0.16
    lines.push({ x1: 0, y1: y, x2: w / 2 - gap / 2, y2: y })
    lines.push({ x1: w / 2 + gap / 2, y1: y, x2: w, y2: y })
  }

  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <rect
        x={strokeWidth / 2}
        y={strokeWidth / 2}
        width={w - strokeWidth}
        height={h - strokeWidth}
        fill="var(--surface-alt)"
        stroke="#111827"
        strokeWidth={strokeWidth}
      />
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="#111827"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}
