import type { LiteRoomRect, LiteTemplate, RoomKind } from '../data/liteTemplates'
import { LITE_PX_PER_METER, getLiteCanvasSize, getLiteRoomRects } from '../data/liteTemplates'

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

function bathroomIcon(x: number, y: number, w: number, h: number, stroke: number, key: string) {
  const pad = Math.min(w, h) * 0.18
  const bx = x + pad
  const by = y + pad
  const bw = w - pad * 2
  const bh = h - pad * 2
  const toiletW = bw * 0.42
  const toiletH = bh * 0.5
  const sinkW = bw * 0.38
  const sinkH = bh * 0.28
  return (
    <g key={key} stroke={FURNITURE_COLOR} strokeWidth={stroke} fill="none">
      <rect x={bx} y={by + bh - toiletH} width={toiletW} height={toiletH} rx={toiletW * 0.3} />
      <ellipse cx={bx + toiletW / 2} cy={by + bh - toiletH * 0.32} rx={toiletW * 0.32} ry={toiletH * 0.26} />
      <rect x={bx + bw - sinkW} y={by} width={sinkW} height={sinkH} rx={sinkH * 0.3} />
    </g>
  )
}

function kitchenIcon(x: number, y: number, w: number, h: number, stroke: number, key: string) {
  const pad = Math.min(w, h) * 0.14
  const kx = x + pad
  const ky = y + pad
  const kw = w - pad * 2
  const counterH = Math.min(h - pad * 2, h * 0.34)
  const burnerR = Math.min(kw, counterH) * 0.15
  return (
    <g key={key} stroke={FURNITURE_COLOR} strokeWidth={stroke} fill="none">
      <rect x={kx} y={ky} width={kw} height={counterH} rx={counterH * 0.15} />
      <circle cx={kx + kw * 0.3} cy={ky + counterH / 2} r={burnerR} />
      <circle cx={kx + kw * 0.7} cy={ky + counterH / 2} r={burnerR} />
    </g>
  )
}

function roomIcons(rect: LiteRoomRect, stroke: number, key: string) {
  const { x, y, w, h, kind } = rect
  if (kind === 'hall') return null

  if (kind === 'living') {
    const sofaH = h * 0.58
    const tableH = h - sofaH
    return (
      <g key={key}>
        {sofaIcon(x, y, w, sofaH, stroke, `${key}-sofa`)}
        {tableIcon(x, y + sofaH, w, tableH, stroke, `${key}-table`)}
      </g>
    )
  }

  const iconW = w * 0.72
  const iconH = h * 0.72
  const ix = x + (w - iconW) / 2
  const iy = y + (h - iconH) / 2

  if (kind === 'bedroom') return bedIcon(ix, iy, iconW, iconH, stroke, key)
  if (kind === 'bathroom') return bathroomIcon(ix, iy, iconW, iconH, stroke, key)
  if (kind === 'kitchen') return kitchenIcon(ix, iy, iconW, iconH, stroke, key)
  return null
}

interface Band {
  yStart: number
  yEnd: number
  kinds: RoomKind[]
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
  const baseStroke = Math.max(3, Math.round(Math.min(w, h) * 0.01))
  const exteriorStroke = baseStroke * 2.3
  const interiorStroke = baseStroke
  const doorStroke = baseStroke * 0.55
  const furnitureStroke = baseStroke * 0.55

  const rects = getLiteRoomRects(template)

  // Interior walls (as thin line segments, broken for a door gap where relevant)
  // and door-swing paths, derived by walking the same column/row structure used
  // to build the room rects.
  const wallSegments: { x1: number; y1: number; x2: number; y2: number }[] = []
  const doorPaths: string[] = []

  let x = 0
  let prevBands: Band[] | null = null
  for (const columnSpec of template.columns) {
    const colW = columnSpec.widthFrac * w
    const bands: Band[] = []
    let y = 0
    for (const rowSpec of columnSpec.rows) {
      const rowH = rowSpec.heightFrac * h
      bands.push({ yStart: y, yEnd: y + rowH, kinds: rowSpec.cells.map((c) => c.kind) })

      // Sub-column divider within this row (e.g. bathroom | hall) — plain wall, no door.
      let xi = x
      rowSpec.cells.forEach((cell, cidx) => {
        const cellW = cell.widthFrac * colW
        if (cidx > 0) {
          wallSegments.push({ x1: xi, y1: y, x2: xi, y2: y + rowH })
        }
        xi += cellW
      })
      y += rowH
    }

    // Row boundaries within this column get a door at the horizontal center.
    for (let i = 0; i < bands.length - 1; i++) {
      const yBoundary = bands[i].yEnd
      const gap = Math.min(colW * 0.32, 42)
      const doorX = x + colW / 2 - gap / 2
      wallSegments.push({ x1: x, y1: yBoundary, x2: doorX, y2: yBoundary })
      wallSegments.push({ x1: doorX + gap, y1: yBoundary, x2: x + colW, y2: yBoundary })
      doorPaths.push(horizontalDoorPath(doorX, yBoundary, gap))
    }

    // Column boundary gets a door too, positioned at the hall (if any) so the
    // hallway visually connects to the next room over.
    if (prevBands) {
      const boundaryX = x
      const hallBand = prevBands.find((b) => b.kinds.includes('hall')) ?? bands.find((b) => b.kinds.includes('hall'))
      const doorYCenter = hallBand ? (hallBand.yStart + hallBand.yEnd) / 2 : h / 2
      const gap = Math.min(h * 0.14, 50)
      const doorYTop = Math.min(Math.max(doorYCenter - gap / 2, 0), h - gap)
      wallSegments.push({ x1: boundaryX, y1: 0, x2: boundaryX, y2: doorYTop })
      wallSegments.push({ x1: boundaryX, y1: doorYTop + gap, x2: boundaryX, y2: h })
      doorPaths.push(verticalDoorPath(boundaryX, doorYTop, gap))
    }

    prevBands = bands
    x += colW
  }

  // Exterior entrance, centered on the bottom wall.
  const entranceGap = Math.min(w * 0.14, 60)
  const entranceLeft = w / 2 - entranceGap / 2
  const entranceDoorPath = horizontalDoorPath(entranceLeft, h, entranceGap)

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
          const labelX = labelAlign === 'left' ? exteriorStroke * 1.5 : w / 2
          return (
            <text
              x={labelX}
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
          x={exteriorStroke / 2}
          y={exteriorStroke / 2}
          width={w - exteriorStroke}
          height={h - exteriorStroke}
          fill="var(--surface-alt)"
          stroke="none"
        />

        {rects.map((r, i) => roomIcons(r, furnitureStroke, `f-${i}`))}

        {wallSegments.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={WALL_COLOR}
            strokeWidth={interiorStroke}
            strokeLinecap="round"
          />
        ))}

        {doorPaths.map((d, i) => (
          <path key={`d-${i}`} d={d} stroke={WALL_COLOR} strokeWidth={doorStroke} fill="none" />
        ))}

        {/* Exterior perimeter, drawn last and thicker so it reads as the outer wall. */}
        <line x1={0} y1={0} x2={w} y2={0} stroke={WALL_COLOR} strokeWidth={exteriorStroke} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={h} stroke={WALL_COLOR} strokeWidth={exteriorStroke} strokeLinecap="round" />
        <line x1={w} y1={0} x2={w} y2={h} stroke={WALL_COLOR} strokeWidth={exteriorStroke} strokeLinecap="round" />
        <line
          x1={0}
          y1={h}
          x2={entranceLeft}
          y2={h}
          stroke={WALL_COLOR}
          strokeWidth={exteriorStroke}
          strokeLinecap="round"
        />
        <line
          x1={entranceLeft + entranceGap}
          y1={h}
          x2={w}
          y2={h}
          stroke={WALL_COLOR}
          strokeWidth={exteriorStroke}
          strokeLinecap="round"
        />
        <path d={entranceDoorPath} stroke={WALL_COLOR} strokeWidth={doorStroke} fill="none" />
      </g>
    </svg>
  )
}
