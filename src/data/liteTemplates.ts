export type TemplateShape = 'square' | 'rect'

export interface LiteTemplate {
  id: string
  label: string
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
    default:
      return [Math.ceil(Math.sqrt(roomCount)), Math.ceil(Math.sqrt(roomCount))]
  }
}

function buildTemplate(id: string, pings: number, shape: TemplateShape, roomCount: number): LiteTemplate {
  const areaM2 = pings * PING_TO_SQM
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
    label: `${pings} 坪 · ${shapeLabel}`,
    pings,
    shape,
    widthMeters: Math.round(widthMeters * 10) / 10,
    depthMeters: Math.round(depthMeters * 10) / 10,
    cols,
    rows,
  }
}

export const LITE_TEMPLATES: LiteTemplate[] = [
  buildTemplate('s-square', 10, 'square', 1),
  buildTemplate('s-rect', 10, 'rect', 2),
  buildTemplate('m-square', 20, 'square', 2),
  buildTemplate('m-rect', 20, 'rect', 3),
  buildTemplate('l-square', 30, 'square', 4),
  buildTemplate('l-rect', 30, 'rect', 4),
  buildTemplate('xl-square', 45, 'square', 6),
  buildTemplate('xl-rect', 45, 'rect', 6),
]

export function getLiteTemplate(id: string): LiteTemplate | undefined {
  return LITE_TEMPLATES.find((t) => t.id === id)
}
