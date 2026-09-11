import type { LiteTemplate } from '../data/liteTemplates'
import { LITE_PX_PER_METER, getLiteCanvasSize } from '../data/liteTemplates'

interface Props {
  template: LiteTemplate
  className?: string
  showLabel?: boolean
  labelAlign?: 'center' | 'left'
  labelScale?: number
}

const WALL_COLOR = '#111827'
const FURNITURE_COLOR = '#9ca3af'

function verticalDoorPath(x: number, yTop: number, gap: number) {
  return `M ${x} ${yTop + gap} A ${gap} ${gap} 0 0 1 ${x + gap} ${yTop} M ${x} ${yTop} L ${x + gap} ${yTop}`
}

function horizontalDoorPath(xLeft: number, y: number, gap: number) {
  return `M ${xLeft + gap} ${y} A ${gap} ${gap} 0 0 1 ${xLeft} ${y + gap} M ${xLeft} ${y} L ${xLeft} ${y + gap}`
}

function bedIcon(x: number, y: number, w: number, h: number, stroke: number, key: string) {
  const pad = Math.min(w, h) * 0.16
  const bx = x + pad
  const by = y + pad
  const bw = w - pad * 2
  const bh = h - pad * 2
  const pillowH = bh * 0.22
  return (
    <g key={key} stroke={FURNITURE_COLOR} strokeWidth={stroke} fill="none">
      <rect x={bx} y={by} width={bw} height={bh} rx={bw * 0.06} />
      <line x1={bx} y1={by + pillowH * 1.5} x2={bx + bw} y2={by + pillowH * 1.5} />
      <rect x={bx + bw * 0.08} y={by + pillowH * 0.3} width={bw * 0.32} height={pillowH} rx={pillowH * 0.3} />
      <rect x={bx + bw * 0.6} y={by + pillowH * 0.3} width={bw * 0.32} height={pillowH} rx={pillowH * 0.3} />
    </g>
  )
}

function sofaIcon(x: number, y: number, w: number, h: number, stroke: number, key: string) {
  const pad = Math.min(w, h) * 0.16
  const sw = w - pad * 2
  const sh = h - pad * 2
  const sx = x + pad
  const sy = y + pad
  const seatH = sh * 0.62
  const armW = sw * 0.14
  return (
    <g key={key} stroke={FURNITURE_COLOR} strokeWidth={stroke} fill="none">
      <rect x={sx} y={sy + sh - seatH} width={sw} height={seatH} rx={sw * 0.05} />
      <rect x={sx} y={sy + sh - seatH} width={armW} height={seatH} rx={sw * 0.05} />
      <rect x={sx + sw - armW} y={sy + sh - seatH} width={armW} height={seatH} rx={sw * 0.05} />
      <rect x={sx + sw * 0.32} y={sy} width={sw * 0.36} height={sh * 0.3} rx={sw * 0.04} />
    </g>
  )
}

function tableIcon(x: number, y: number, w: number, h: number, stroke: number, key: string) {
  const cx = x + w / 2
  const cy = y + h / 2
  const r = Math.min(w, h) * 0.28
  const chairR = r * 0.42
  const chairOffset = r * 1.55
  return (
    <g key={key} stroke={FURNITURE_COLOR} strokeWidth={stroke} fill="none">
      <circle cx={cx} cy={cy} r={r} />
      <circle cx={cx} cy={cy - chairOffset} r={chairR} />
      <circle cx={cx} cy={cy + chairOffset} r={chairR} />
      <circle cx={cx - chairOffset} cy={cy} r={chairR} />
      <circle cx={cx + chairOffset} cy={cy} r={chairR} />
    </g>
  )
}

export default function LiteFloorPlanSvg({
  template,
  className,
  showLabel = true,
  labelAlign = 'center',
  labelScale = 1,
}: Props) {
  const w = template.widthMeters * LITE_PX_PER_METER
  const h = template.depthMeters * LITE_PX_PER_METER
  const strokeWidth = Math.max(4, Math.round(Math.min(w, h) * 0.012))
  const furnitureStroke = strokeWidth * 0.55

  const cellW = w / template.cols
  const cellH = h / template.rows

  const walls: { x1: number; y1: number; x2: number; y2: number }[] = []
  const doorPaths: string[] = []

  for (let c = 1; c < template.cols; c++) {
    const x = cellW * c
    const gap = Math.min(h * 0.16, cellH * 0.5)
    const gapTop = h / 2 - gap / 2
    walls.push({ x1: x, y1: 0, x2: x, y2: gapTop })
    walls.push({ x1: x, y1: gapTop + gap, x2: x, y2: h })
    doorPaths.push(verticalDoorPath(x, gapTop, gap))
  }

  for (let r = 1; r < template.rows; r++) {
    const y = cellH * r
    const gap = Math.min(w * 0.16, cellW * 0.5)
    const gapLeft = w / 2 - gap / 2
    walls.push({ x1: 0, y1: y, x2: gapLeft, y2: y })
    walls.push({ x1: gapLeft + gap, y1: y, x2: w, y2: y })
    doorPaths.push(horizontalDoorPath(gapLeft, y, gap))
  }

  // Exterior entrance, centered on the bottom wall.
  const entranceGap = Math.min(w * 0.14, 60)
  const entranceLeft = w / 2 - entranceGap / 2
  const bottomWalls = [
    { x1: 0, y1: h, x2: entranceLeft, y2: h },
    { x1: entranceLeft + entranceGap, y1: h, x2: w, y2: h },
  ]
  const entranceDoorPath = horizontalDoorPath(entranceLeft, h, entranceGap)

  const roomCount = template.cols * template.rows
  const furniture = []
  for (let i = 0; i < roomCount; i++) {
    const c = i % template.cols
    const r = Math.floor(i / template.cols)
    const cx = c * cellW
    const cy = r * cellH
    const iconW = cellW * 0.7
    const iconH = cellH * 0.7
    const ix = cx + (cellW - iconW) / 2
    const iy = cy + (cellH - iconH) / 2
    const key = `f-${i}`
    if (i === 0) {
      furniture.push(bedIcon(ix, iy, iconW, iconH, furnitureStroke, key))
    } else if (i === roomCount - 1) {
      furniture.push(sofaIcon(ix, iy, iconW, iconH, furnitureStroke, key))
    } else {
      furniture.push(tableIcon(ix, iy, iconW, iconH, furnitureStroke, key))
    }
  }

  const { height: totalH, labelFontSize, labelMarginTop } = getLiteCanvasSize(template)

  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${totalH}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      {showLabel &&
        (() => {
          const fontSize = labelFontSize * labelScale
          const x = labelAlign === 'left' ? strokeWidth * 2 : w / 2
          return (
            <text
              x={x}
              y={labelMarginTop * 0.62}
              textAnchor={labelAlign === 'left' ? 'start' : 'middle'}
              fontSize={fontSize}
              fontWeight="600"
              fill="var(--text-muted)"
            >
              {template.rangeLabel} 坪
            </text>
          )
        })()}

      <g transform={`translate(0, ${labelMarginTop})`}>
        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={w - strokeWidth}
          height={h - strokeWidth}
          fill="var(--surface-alt)"
          stroke="none"
        />

        {furniture}

        <line x1={0} y1={0} x2={w} y2={0} stroke={WALL_COLOR} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={h} stroke={WALL_COLOR} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1={w} y1={0} x2={w} y2={h} stroke={WALL_COLOR} strokeWidth={strokeWidth} strokeLinecap="round" />
        {bottomWalls.map((l, i) => (
          <line
            key={`bw-${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={WALL_COLOR}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ))}

        {walls.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={WALL_COLOR}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ))}

        {doorPaths.map((d, i) => (
          <path key={`d-${i}`} d={d} stroke={WALL_COLOR} strokeWidth={strokeWidth * 0.5} fill="none" />
        ))}
        <path d={entranceDoorPath} stroke={WALL_COLOR} strokeWidth={strokeWidth * 0.5} fill="none" />
      </g>
    </svg>
  )
}
