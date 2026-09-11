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
