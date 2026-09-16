export type TemplateShape = 'square' | 'rect'

export interface LiteTemplate {
  id: string
  label: string
  rangeLabel: string
  pings: number
  shape: TemplateShape
  widthMeters: number
  depthMeters: number
  cols: number
  rows: number
}

/** Fixed content-space scale for every lite template, so no manual calibration step is needed. */
export const LITE_PX_PER_METER = 60

const PING_TO_SQM = 3.305785
const RECT_ASPECT_RATIO = 2.2

function squareLikeGrid(roomCount: number): [number, number] {
  switch (roomCount) {
    case 1:
      return [1, 1]
    case 2:
      return [2, 1]
    case 4:
      return [2, 2]
    case 6:
      return [3, 2]
    case 8:
      return [4, 2]
    default:
      return [Math.ceil(Math.sqrt(roomCount)), Math.ceil(Math.sqrt(roomCount))]
  }
}

function buildTemplate(
  id: string,
  rangeLabel: string,
  representativePings: number,
  shape: TemplateShape,
  roomCount: number,
): LiteTemplate {
  const areaM2 = representativePings * PING_TO_SQM
  let widthMeters: number
  let depthMeters: number
  let cols: number
  let rows: number

  if (shape === 'square') {
    const side = Math.sqrt(areaM2)
    widthMeters = side
    depthMeters = side
    ;[cols, rows] = squareLikeGrid(roomCount)
  } else {
    // Landscape orientation: wider than deep, rooms arranged in a row.
    widthMeters = Math.sqrt(areaM2 * RECT_ASPECT_RATIO)
    depthMeters = areaM2 / widthMeters
    cols = roomCount
    rows = 1
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
    cols,
    rows,
  }
}

export const LITE_TEMPLATES: LiteTemplate[] = [
  buildTemplate('s-square', '15–30', 22.5, 'square', 2),
  buildTemplate('s-rect', '15–30', 22.5, 'rect', 3),
  buildTemplate('m-square', '30–50', 40, 'square', 4),
  buildTemplate('m-rect', '30–50', 40, 'rect', 4),
  buildTemplate('l-square', '50–70', 60, 'square', 6),
  buildTemplate('l-rect', '50–70', 60, 'rect', 6),
  buildTemplate('xl-square', '70–100', 85, 'square', 8),
  buildTemplate('xl-rect', '70–100', 85, 'rect', 8),
]

export function getLiteTemplate(id: string): LiteTemplate | undefined {
  return LITE_TEMPLATES.find((t) => t.id === id)
}

/** Templates that ship with a pre-populated 2-device demo layout when a new project is created. */
export const LITE_DEMO_TEMPLATE_IDS = ['m-square', 'm-rect']

export const LITE_DEFAULT_TEMPLATE_ID = 'm-square'

/**
 * Two sensible device spots (opposite rooms on the grid, e.g. main router + Mesh
 * node) for a "ready-made effect" demo layout, in the same content-space
 * coordinates used by placed devices (room grid + label header offset).
 */
export function getLiteDefaultDevicePositions(template: LiteTemplate): { x: number; y: number }[] {
  const width = template.widthMeters * LITE_PX_PER_METER
  const planHeight = template.depthMeters * LITE_PX_PER_METER
  const cellW = width / template.cols
  const cellH = planHeight / template.rows
  const { labelMarginTop } = getLiteCanvasSize(template)
  const roomCount = template.cols * template.rows

  function roomCenter(i: number) {
    const c = i % template.cols
    const r = Math.floor(i / template.cols)
    return { x: c * cellW + cellW / 2, y: r * cellH + cellH / 2 + labelMarginTop }
  }

  return [roomCenter(0), roomCenter(roomCount - 1)]
}

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
