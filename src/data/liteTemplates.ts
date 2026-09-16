export type TemplateShape = 'square' | 'rect'

export type RoomKind = 'bedroom' | 'bathroom' | 'hall' | 'living' | 'kitchen'

export interface RoomCellSpec {
  kind: RoomKind
  /** Fraction of the row's column width; cells in the same row sum to 1. */
  widthFrac: number
}

export interface RowSpec {
  /** Fraction of the column's total height; rows in the same column sum to 1. */
  heightFrac: number
  cells: RoomCellSpec[]
}

export interface ColumnSpec {
  /** Fraction of the template's total width; columns sum to 1. */
  widthFrac: number
  rows: RowSpec[]
}

export interface LiteTemplate {
  id: string
  label: string
  rangeLabel: string
  pings: number
  shape: TemplateShape
  widthMeters: number
  depthMeters: number
  columns: ColumnSpec[]
}

/** Fixed content-space scale for every lite template, so no manual calibration step is needed. */
export const LITE_PX_PER_METER = 60

const PING_TO_SQM = 3.305785
/** Landscape aspect ratio for the "rect" shape — kept modest so rooms stay proportional. */
const RECT_ASPECT_RATIO = 1.5

function col(widthFrac: number, rows: RowSpec[]): ColumnSpec {
  return { widthFrac, rows }
}

function room(heightFrac: number, kind: RoomKind): RowSpec {
  return { heightFrac, cells: [{ kind, widthFrac: 1 }] }
}

function splitRoom(heightFrac: number, cells: [RoomKind, number][]): RowSpec {
  return { heightFrac, cells: cells.map(([kind, widthFrac]) => ({ kind, widthFrac })) }
}

// Hand-authored, realistically proportioned layouts per size tier — a narrower
// utility column (bath/hall/bedrooms) beside a big open living area, growing
// into more bedrooms/bathrooms and a separate kitchen for larger tiers.

const S_COLUMNS: ColumnSpec[] = [
  col(0.4, [
    splitRoom(0.22, [
      ['bathroom', 0.5],
      ['hall', 0.5],
    ]),
    room(0.39, 'bedroom'),
    room(0.39, 'bedroom'),
  ]),
  col(0.6, [room(1, 'living')]),
]

const M_COLUMNS: ColumnSpec[] = [
  col(0.42, [
    splitRoom(0.16, [
      ['bathroom', 0.5],
      ['hall', 0.5],
    ]),
    room(0.28, 'bedroom'),
    room(0.28, 'bedroom'),
    room(0.28, 'bedroom'),
  ]),
  col(0.58, [room(1, 'living')]),
]

const L_COLUMNS: ColumnSpec[] = [
  col(0.36, [
    splitRoom(0.14, [
      ['bathroom', 0.5],
      ['hall', 0.5],
    ]),
    room(0.22, 'bedroom'),
    room(0.22, 'bedroom'),
    room(0.2, 'bedroom'),
    room(0.22, 'bathroom'),
  ]),
  col(0.22, [room(0.35, 'kitchen'), room(0.65, 'bedroom')]),
  col(0.42, [room(1, 'living')]),
]

const XL_COLUMNS: ColumnSpec[] = [
  col(0.3, [
    splitRoom(0.12, [
      ['bathroom', 0.5],
      ['hall', 0.5],
    ]),
    room(0.22, 'bedroom'),
    room(0.22, 'bedroom'),
    room(0.22, 'bedroom'),
    room(0.22, 'bathroom'),
  ]),
  col(0.28, [room(0.18, 'bathroom'), room(0.4, 'bedroom'), room(0.42, 'kitchen')]),
  col(0.42, [room(1, 'living')]),
]

function buildTemplate(
  id: string,
  rangeLabel: string,
  representativePings: number,
  shape: TemplateShape,
  columns: ColumnSpec[],
): LiteTemplate {
  const areaM2 = representativePings * PING_TO_SQM
  let widthMeters: number
  let depthMeters: number

  if (shape === 'square') {
    const side = Math.sqrt(areaM2)
    widthMeters = side
    depthMeters = side
  } else {
    widthMeters = Math.sqrt(areaM2 * RECT_ASPECT_RATIO)
    depthMeters = areaM2 / widthMeters
  }

  const shapeLabel = shape === 'square' ? '方形' : '長型'
  return {
    id,
    label: `${rangeLabel} 坪 · ${shapeLabel}`,
    rangeLabel,
    pings: representativePings,
    shape,
    widthMeters: Math.round(widthMeters * 10) / 10,
    depthMeters: Math.round(depthMeters * 10) / 10,
    columns,
  }
}

export const LITE_TEMPLATES: LiteTemplate[] = [
  buildTemplate('s-square', '15–30', 22.5, 'square', S_COLUMNS),
  buildTemplate('s-rect', '15–30', 22.5, 'rect', S_COLUMNS),
  buildTemplate('m-square', '30–50', 40, 'square', M_COLUMNS),
  buildTemplate('m-rect', '30–50', 40, 'rect', M_COLUMNS),
  buildTemplate('l-square', '50–70', 60, 'square', L_COLUMNS),
  buildTemplate('l-rect', '50–70', 60, 'rect', L_COLUMNS),
  buildTemplate('xl-square', '70–100', 85, 'square', XL_COLUMNS),
  buildTemplate('xl-rect', '70–100', 85, 'rect', XL_COLUMNS),
]

export function getLiteTemplate(id: string): LiteTemplate | undefined {
  return LITE_TEMPLATES.find((t) => t.id === id)
}

/** Templates that ship with a pre-populated 2-device demo layout when a new project is created. */
export const LITE_DEMO_TEMPLATE_IDS = ['m-square', 'm-rect']

export const LITE_DEFAULT_TEMPLATE_ID = 'm-square'

/**
 * Reserves a small strip above the drawn floor plan for the ping-range caption, so the
 * label never overlaps the plan itself. Both LiteFloorPlanSvg and FloorCanvas2D (for the
 * editor's naturalSize) must agree on this size, or device placement will misalign with
 * the rendered plan.
 */
export function getLiteCanvasSize(template: LiteTemplate): {
  width: number
  height: number
  labelFontSize: number
  labelMarginTop: number
} {
  const width = template.widthMeters * LITE_PX_PER_METER
  const planHeight = template.depthMeters * LITE_PX_PER_METER
  const labelFontSize = Math.max(11, Math.round(Math.min(width, planHeight) * 0.05))
  const labelMarginTop = labelFontSize * 1.9
  return { width, height: planHeight + labelMarginTop, labelFontSize, labelMarginTop }
}

export interface LiteRoomRect {
  x: number
  y: number
  w: number
  h: number
  kind: RoomKind
}

/** Every room's pixel-space rect (content space, before the label header offset). */
export function getLiteRoomRects(template: LiteTemplate): LiteRoomRect[] {
  const width = template.widthMeters * LITE_PX_PER_METER
  const height = template.depthMeters * LITE_PX_PER_METER
  const rects: LiteRoomRect[] = []

  let x = 0
  for (const columnSpec of template.columns) {
    const colW = columnSpec.widthFrac * width
    let y = 0
    for (const rowSpec of columnSpec.rows) {
      const rowH = rowSpec.heightFrac * height
      let xi = x
      for (const cell of rowSpec.cells) {
        const cellW = cell.widthFrac * colW
        rects.push({ x: xi, y, w: cellW, h: rowH, kind: cell.kind })
        xi += cellW
      }
      y += rowH
    }
    x += colW
  }
  return rects
}

/**
 * Two sensible device spots — the main living area plus whichever room sits
 * farthest from it — for a "ready-made effect" demo layout, in the same
 * content-space coordinates used by placed devices (room grid + label header offset).
 */
export function getLiteDefaultDevicePositions(template: LiteTemplate): { x: number; y: number }[] {
  const rects = getLiteRoomRects(template)
  const { labelMarginTop } = getLiteCanvasSize(template)
  const centerOf = (r: LiteRoomRect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 })

  const living = rects.find((r) => r.kind === 'living') ?? rects[rects.length - 1]
  const a = centerOf(living)

  // Prefer a bedroom (or kitchen) for the second device — a router demo reads
  // oddly parked in the bathroom or hall, even if those are geometrically farthest.
  const candidates = rects.filter((r) => r !== living && r.kind !== 'bathroom' && r.kind !== 'hall')
  const pool = candidates.length > 0 ? candidates : rects.filter((r) => r !== living)

  let best: LiteRoomRect | null = null
  let bestDist = -1
  for (const r of pool) {
    const c = centerOf(r)
    const d = Math.hypot(c.x - a.x, c.y - a.y)
    if (d > bestDist) {
      bestDist = d
      best = r
    }
  }
  const b = best ? centerOf(best) : a

  return [
    { x: a.x, y: a.y + labelMarginTop },
    { x: b.x, y: b.y + labelMarginTop },
  ]
}
