import { useEffect, useRef, useState } from 'react'
import type { Band, CalibrationLine, Device, TestClient, Wall } from '../types'
import { getRouterModel } from '../data/routerCatalog'
import { getWallMaterial } from '../data/wallMaterials'
import { getClientType } from '../data/clientTypes'
import type { LiteTemplate } from '../data/liteTemplates'
import { getLiteCanvasSize } from '../data/liteTemplates'
import LiteFloorPlanSvg from './LiteFloorPlanSvg'
import {
  bestRouterConnection,
  bestSignalDbm,
  distanceInMeters,
  signalToStrength,
  strengthToColor,
  wallAttenuationBetween,
} from '../lib/signalModel'
import { RouterIcon, PhoneIcon, CheckIcon, CloseIcon, UndoIcon } from './icons'
import './FloorCanvas2D.css'

export type CanvasMode = 'select' | 'pan' | 'place' | 'calibrate' | 'draw-wall'

const CALIBRATION_COLOR = '#e6007e'

interface Point {
  x: number
  y: number
}

interface Transform {
  scale: number
  tx: number
  ty: number
}

interface Props {
  imageUrl: string | null
  template?: LiteTemplate | null
  naturalSize: { width: number; height: number } | null
  onNaturalSize: (size: { width: number; height: number }) => void
  devices: Device[]
  walls: Wall[]
  selectedWallId: string | null
  onSelectWall: (id: string | null) => void
  onWallComplete: (points: Point[]) => void
  wallMaterialReady: boolean
  onRequestWallMaterial: () => void
  clients: TestClient[]
  selectedClientId: string | null
  onSelectClient: (id: string | null) => void
  onMoveClient: (id: string, x: number, y: number) => void
  onClientDragStart: (id: string) => void
  onClientDragEnd: (id: string) => void
  mode: CanvasMode
  transform: Transform
  onTransformChange: (t: Transform) => void
  onPlaceAt: (x: number, y: number) => void
  onSelectDevice: (id: string | null) => void
  onMoveDevice: (id: string, x: number, y: number) => void
  onDeviceDragStart: (id: string) => void
  onDeviceDragEnd: (id: string) => void
  selectedDeviceId: string | null
  band: Band
  scalePxPerMeter: number | null
  onCalibratePoints: (a: Point, b: Point) => void
  calibrationPending: boolean
  calibrationLines?: CalibrationLine[]
  onEditCalibration?: (line: CalibrationLine) => void
  onLiveSignalChange?: (info: { distanceMeters: number; dbm: number; color: string } | null) => void
}

const ANGLE_SNAP_DEG = 15
const WALL_HIT_TOLERANCE_PX = 10

function snapPoint(from: Point, to: Point): Point {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  if (distance < 1) return to
  const angle = Math.atan2(dy, dx)
  const snapRad = (ANGLE_SNAP_DEG * Math.PI) / 180
  const snappedAngle = Math.round(angle / snapRad) * snapRad
  return {
    x: from.x + Math.cos(snappedAngle) * distance,
    y: from.y + Math.sin(snappedAngle) * distance,
  }
}

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lengthSq = dx * dx + dy * dy
  if (lengthSq === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq
  t = Math.max(0, Math.min(1, t))
  const projX = a.x + t * dx
  const projY = a.y + t * dy
  return Math.hypot(p.x - projX, p.y - projY)
}

export default function FloorCanvas2D({
  imageUrl,
  template = null,
  naturalSize,
  onNaturalSize,
  devices,
  walls,
  selectedWallId,
  onSelectWall,
  onWallComplete,
  wallMaterialReady,
  onRequestWallMaterial,
  clients,
  selectedClientId,
  onSelectClient,
  onMoveClient,
  onClientDragStart,
  onClientDragEnd,
  mode,
  transform,
  onTransformChange,
  onPlaceAt,
  onSelectDevice,
  onMoveDevice,
  onDeviceDragStart,
  onDeviceDragEnd,
  selectedDeviceId,
  band,
  scalePxPerMeter,
  onCalibratePoints,
  calibrationPending,
  calibrationLines = [],
  onEditCalibration,
  onLiveSignalChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const draggingDeviceId = useRef<string | null>(null)
  const draggingClientId = useRef<string | null>(null)
  const panState = useRef<{ x: number; y: number } | null>(null)
  const dragMoved = useRef(false)
  const activePointerIds = useRef<Set<number>>(new Set())
  const activeDragPointerId = useRef<number | null>(null)
  const lastDeviceTap = useRef<{ id: string; time: number } | null>(null)
  const [calibrationFirstPoint, setCalibrationFirstPoint] = useState<Point | null>(null)
  const [calibrationSecondPoint, setCalibrationSecondPoint] = useState<Point | null>(null)
  const [wallDrawPoints, setWallDrawPoints] = useState<Point[]>([])
  const [liveDragClientId, setLiveDragClientId] = useState<string | null>(null)

  useEffect(() => {
    if (template) {
      const { width, height } = getLiteCanvasSize(template)
      onNaturalSize({ width, height })
    }
  }, [template])

  useEffect(() => {
    if (mode !== 'draw-wall') setWallDrawPoints([])
    if (mode !== 'calibrate') {
      setCalibrationFirstPoint(null)
      setCalibrationSecondPoint(null)
    }
  }, [mode])

  useEffect(() => {
    if (!calibrationPending) {
      setCalibrationFirstPoint(null)
      setCalibrationSecondPoint(null)
    }
  }, [calibrationPending])

  function toContainerPoint(clientX: number, clientY: number) {
    const rect = containerRef.current!.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function screenToContent(clientX: number, clientY: number) {
    const { x: sx, y: sy } = toContainerPoint(clientX, clientY)
    return {
      x: (sx - transform.tx) / transform.scale,
      y: (sy - transform.ty) / transform.scale,
    }
  }

  function handlePointerDownCapture(e: React.PointerEvent) {
    activePointerIds.current.add(e.pointerId)
  }

  function handlePointerUpOrCancelCapture(e: React.PointerEvent) {
    activePointerIds.current.delete(e.pointerId)
  }

  function handleBackgroundPointerDown(e: React.PointerEvent) {
    if (
      (e.target as HTMLElement).closest('.fc-device') ||
      (e.target as HTMLElement).closest('.fc-client') ||
      (e.target as HTMLElement).closest('.fc-wall-controls')
    )
      return

    // A second finger touching down mid-gesture means this is a pinch, not a
    // tap — ignore it so it doesn't get misread as a point/vertex placement.
    if (activePointerIds.current.size > 1 && (mode === 'place' || mode === 'calibrate' || mode === 'draw-wall')) {
      return
    }

    const point = screenToContent(e.clientX, e.clientY)

    if (mode === 'place') {
      onPlaceAt(point.x, point.y)
      return
    }
    if (mode === 'calibrate') {
      if (!calibrationFirstPoint) {
        setCalibrationFirstPoint(point)
      } else if (!calibrationSecondPoint) {
        setCalibrationSecondPoint(point)
        onCalibratePoints(calibrationFirstPoint, point)
      }
      return
    }
    if (mode === 'draw-wall') {
      if (!wallMaterialReady) {
        onRequestWallMaterial()
        return
      }
      setWallDrawPoints((prev) => {
        if (prev.length === 0) return [point]
        const last = prev[prev.length - 1]
        return [...prev, snapPoint(last, point)]
      })
      return
    }
    if (mode === 'pan' || mode === 'select') {
      // A drag or pan is already being driven by another finger — ignore
      // this one instead of hijacking the transform with its coordinates.
      // Zoom is only ever done via the +/- buttons, not touch gestures.
      if (activeDragPointerId.current !== null) return

      if (mode === 'select') {
        const toleranceContent = WALL_HIT_TOLERANCE_PX / transform.scale
        let closestId: string | null = null
        let closestDist = toleranceContent
        for (const wall of walls) {
          for (let i = 0; i < wall.points.length - 1; i++) {
            const d = distanceToSegment(point, wall.points[i], wall.points[i + 1])
            if (d < closestDist) {
              closestDist = d
              closestId = wall.id
            }
          }
        }
        if (closestId) {
          onSelectWall(closestId)
          onSelectDevice(null)
          return
        }
        onSelectWall(null)
      }
      onSelectDevice(null)
      onSelectClient(null)
      panState.current = { x: e.clientX, y: e.clientY }
      activeDragPointerId.current = e.pointerId
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (activeDragPointerId.current !== null && e.pointerId !== activeDragPointerId.current) return
    if (draggingDeviceId.current) {
      dragMoved.current = true
      const point = screenToContent(e.clientX, e.clientY)
      onMoveDevice(draggingDeviceId.current, point.x, point.y)
      return
    }
    if (draggingClientId.current) {
      dragMoved.current = true
      const point = screenToContent(e.clientX, e.clientY)
      onMoveClient(draggingClientId.current, point.x, point.y)
      return
    }
    if (panState.current) {
      const dx = e.clientX - panState.current.x
      const dy = e.clientY - panState.current.y
      panState.current = { x: e.clientX, y: e.clientY }
      onTransformChange({ ...transform, tx: transform.tx + dx, ty: transform.ty + dy })
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (activeDragPointerId.current !== e.pointerId) return

    if (draggingDeviceId.current) {
      if (dragMoved.current) {
        onDeviceDragEnd(draggingDeviceId.current)
      } else {
        const id = draggingDeviceId.current
        const now = Date.now()
        const last = lastDeviceTap.current
        if (last && last.id === id && now - last.time < 350) {
          onSelectDevice(id)
          lastDeviceTap.current = null
        } else {
          lastDeviceTap.current = { id, time: now }
        }
      }
    }
    if (draggingClientId.current) {
      if (dragMoved.current) {
        onClientDragEnd(draggingClientId.current)
      } else {
        onSelectClient(draggingClientId.current)
      }
    }
    draggingDeviceId.current = null
    draggingClientId.current = null
    setLiveDragClientId(null)
    panState.current = null
    activeDragPointerId.current = null
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* no-op */
    }
  }

  function handleDevicePointerDown(e: React.PointerEvent, deviceId: string) {
    if (mode !== 'select' && mode !== 'place') return
    if (activeDragPointerId.current !== null) return
    e.stopPropagation()
    dragMoved.current = false
    draggingDeviceId.current = deviceId
    activeDragPointerId.current = e.pointerId
    onDeviceDragStart(deviceId)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handleClientPointerDown(e: React.PointerEvent, clientId: string) {
    if (mode !== 'select' && mode !== 'place') return
    if (activeDragPointerId.current !== null) return
    e.stopPropagation()
    dragMoved.current = false
    draggingClientId.current = clientId
    setLiveDragClientId(clientId)
    activeDragPointerId.current = e.pointerId
    onClientDragStart(clientId)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function finishWall() {
    if (wallDrawPoints.length >= 2) onWallComplete(wallDrawPoints)
    setWallDrawPoints([])
  }

  function cancelWall() {
    setWallDrawPoints([])
  }

  function undoLastWallPoint() {
    setWallDrawPoints((prev) => prev.slice(0, -1))
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !naturalSize) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = naturalSize.width
    canvas.height = naturalSize.height

    const pxPerMeter = scalePxPerMeter ?? 60
    const step = Math.max(8, Math.round(naturalSize.width / 120))
    const withModels = devices
      .map((d) => ({ d, model: getRouterModel(d.modelId) }))
      .filter((x) => x.model)
    // Lite templates reserve a label strip above the room; the heatmap must not tint it.
    const roomTop = template ? getLiteCanvasSize(template).labelMarginTop : 0

    const imageData = ctx.createImageData(naturalSize.width, naturalSize.height)
    for (let y = 0; y < naturalSize.height; y += step) {
      for (let x = 0; x < naturalSize.width; x += step) {
        let dbm = -95
        if (withModels.length > 0) {
          dbm = bestSignalDbm(
            withModels.map(({ d, model }) => ({
              distanceMeters: distanceInMeters({ x, y }, d, pxPerMeter),
              txPowerTier: model!.txPowerTier,
              wallAttenuationDb: wallAttenuationBetween(d, { x, y }, walls, band),
            })),
            band,
          )
        }
        const strength = signalToStrength(dbm)
        const [r, g, b] = strengthToColor(strength)
        const alphaBase = withModels.length > 0 ? Math.round(120 + strength * 60) : 0

        for (let yy = 0; yy < step && y + yy < naturalSize.height; yy++) {
          for (let xx = 0; xx < step && x + xx < naturalSize.width; xx++) {
            const py = y + yy
            const idx = (py * naturalSize.width + (x + xx)) * 4
            imageData.data[idx] = r
            imageData.data[idx + 1] = g
            imageData.data[idx + 2] = b
            imageData.data[idx + 3] = py >= roomTop ? alphaBase : 0
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }, [devices, walls, naturalSize, band, scalePxPerMeter, template])

  const lastDrawPoint = wallDrawPoints[wallDrawPoints.length - 1]
  const wallControlsFlip = (() => {
    if (!lastDrawPoint || !containerRef.current) return false
    const containerWidth = containerRef.current.clientWidth
    const screenX = lastDrawPoint.x * transform.scale + transform.tx
    return screenX > containerWidth - 140
  })()
  const pxPerMeter = scalePxPerMeter ?? 60
  const routerCandidates = devices
    .map((d) => {
      const model = getRouterModel(d.modelId)
      return model ? { id: d.id, x: d.x, y: d.y, txPowerTier: model.txPowerTier } : null
    })
    .filter((c): c is { id: string; x: number; y: number; txPowerTier: number } => c !== null)

  function getClientConnection(client: TestClient) {
    const clientType = getClientType(client.clientTypeId)
    const connection = bestRouterConnection(client, routerCandidates, walls, pxPerMeter, band, clientType.sensitivityBonusDb)
    if (!connection) return null
    const router = routerCandidates.find((r) => r.id === connection.routerId)
    if (!router) return null
    const [cr, cg, cb] = strengthToColor(signalToStrength(connection.dbm))
    return { connection, router, color: `rgb(${cr}, ${cg}, ${cb})` }
  }

  const liveDragClient = liveDragClientId ? clients.find((c) => c.id === liveDragClientId) ?? null : null
  const liveDragResult = liveDragClient ? getClientConnection(liveDragClient) : null

  useEffect(() => {
    onLiveSignalChange?.(
      liveDragResult
        ? {
            distanceMeters: liveDragResult.connection.distanceMeters,
            dbm: liveDragResult.connection.dbm,
            color: liveDragResult.color,
          }
        : null,
    )
  }, [liveDragResult?.connection.distanceMeters, liveDragResult?.connection.dbm, liveDragResult?.color])

  return (
    <div
      ref={containerRef}
      className={`fc-container fc-mode-${mode}`}
      onPointerDownCapture={handlePointerDownCapture}
      onPointerUpCapture={handlePointerUpOrCancelCapture}
      onPointerCancelCapture={handlePointerUpOrCancelCapture}
      onPointerDown={handleBackgroundPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="fc-content"
        style={{
          transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
          width: naturalSize?.width ?? 0,
          height: naturalSize?.height ?? 0,
        }}
      >
        {template ? (
          <LiteFloorPlanSvg className="fc-image" template={template} labelAlign="left" labelScale={0.6} />
        ) : (
          imageUrl && (
            <img
              className="fc-image"
              src={imageUrl}
              alt="floor plan"
              draggable={false}
              onLoad={(e) => {
                const img = e.currentTarget
                onNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
              }}
            />
          )
        )}

        <canvas
          ref={canvasRef}
          className={`fc-heatmap${mode === 'calibrate' || mode === 'pan' ? ' fc-heatmap-hidden' : ''}`}
        />

        {naturalSize && (
          <svg
            className="fc-walls-svg"
            width={naturalSize.width}
            height={naturalSize.height}
            viewBox={`0 0 ${naturalSize.width} ${naturalSize.height}`}
          >
            {mode !== 'calibrate' &&
              !(mode === 'select' && calibrationLines.length > 0) &&
              walls.map((wall) => {
                const material = getWallMaterial(wall.materialId)
                const points = wall.points.map((p) => `${p.x},${p.y}`).join(' ')
                const selected = wall.id === selectedWallId
                return (
                  <polyline
                    key={wall.id}
                    points={points}
                    fill="none"
                    stroke={selected ? '#ef4444' : material?.color ?? '#888'}
                    strokeWidth={selected ? 13 : 10}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )
              })}
            {wallDrawPoints.length > 0 && (
              <>
                <polyline
                  points={wallDrawPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={10}
                  strokeDasharray="16 9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {wallDrawPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={9} fill="var(--accent)" />
                ))}
              </>
            )}
            {calibrationFirstPoint && calibrationSecondPoint && (
              <line
                x1={calibrationFirstPoint.x}
                y1={calibrationFirstPoint.y}
                x2={calibrationSecondPoint.x}
                y2={calibrationSecondPoint.y}
                stroke={CALIBRATION_COLOR}
                strokeWidth={10}
                strokeLinecap="round"
              />
            )}
            {calibrationFirstPoint && (
              <circle
                cx={calibrationFirstPoint.x}
                cy={calibrationFirstPoint.y}
                r={9}
                fill={CALIBRATION_COLOR}
                stroke="#fff"
                strokeWidth={2.5}
              />
            )}
            {calibrationSecondPoint && (
              <circle
                cx={calibrationSecondPoint.x}
                cy={calibrationSecondPoint.y}
                r={9}
                fill={CALIBRATION_COLOR}
                stroke="#fff"
                strokeWidth={2.5}
              />
            )}
            {(mode === 'select' || mode === 'calibrate') &&
              calibrationLines.map((line) => {
                // While the first point of a NEW line is already placed, a tap
                // near an existing line must land the second point instead of
                // opening that line's edit sheet — let it pass through.
                const editable = !(mode === 'calibrate' && calibrationFirstPoint)
                return (
                  <g
                    key={line.id}
                    style={editable ? { pointerEvents: 'auto', cursor: 'pointer' } : { pointerEvents: 'none' }}
                    onPointerDown={editable ? (e) => e.stopPropagation() : undefined}
                    onClick={editable ? () => onEditCalibration?.(line) : undefined}
                  >
                    <line
                      x1={line.a.x}
                      y1={line.a.y}
                      x2={line.b.x}
                      y2={line.b.y}
                      stroke={CALIBRATION_COLOR}
                      strokeWidth={10}
                      strokeLinecap="round"
                    />
                  </g>
                )
              })}
            {mode !== 'calibrate' &&
              clients.map((client) => {
                const result = getClientConnection(client)
                if (!result) return null
                const { router, color } = result
                return (
                  <line
                    key={client.id}
                    x1={client.x}
                    y1={client.y}
                    x2={router.x}
                    y2={router.y}
                    stroke={color}
                    strokeWidth={3}
                    strokeOpacity={0.85}
                  />
                )
              })}
          </svg>
        )}

        {devices.map((device) => {
          const model = getRouterModel(device.modelId)
          const selected = device.id === selectedDeviceId
          return (
            <div
              key={device.id}
              className={`fc-device ${selected ? 'fc-device-selected' : ''}`}
              style={{
                left: device.x,
                top: device.y,
                transform: `translate(-50%, -50%) scale(${1 / transform.scale})`,
              }}
              onPointerDown={(e) => handleDevicePointerDown(e, device.id)}
            >
              <div className="fc-device-dot" style={{ transform: `rotate(${device.rotation}deg)` }}>
                <RouterIcon size={16} />
              </div>
              <div className="fc-device-label">{model?.name ?? device.modelId}</div>
            </div>
          )
        })}

        {clients.map((client) => {
          const selected = client.id === selectedClientId
          return (
            <div
              key={client.id}
              className={`fc-client ${selected ? 'fc-client-selected' : ''}`}
              style={{
                left: client.x,
                top: client.y,
                transform: `translate(-50%, -50%) scale(${1 / transform.scale})`,
              }}
              onPointerDown={(e) => handleClientPointerDown(e, client.id)}
            >
              <div className="fc-client-dot">
                <PhoneIcon size={14} />
              </div>
            </div>
          )
        })}

        {mode === 'draw-wall' && lastDrawPoint && wallDrawPoints.length >= 1 && (
          <div
            className="fc-wall-controls"
            style={{
              left: lastDrawPoint.x,
              top: lastDrawPoint.y,
              transform: wallControlsFlip
                ? `translate(calc(-100% - 12px), -50%) scale(${1 / transform.scale})`
                : `translate(12px, -50%) scale(${1 / transform.scale})`,
              transformOrigin: wallControlsFlip ? 'right center' : 'left center',
            }}
          >
            {wallDrawPoints.length >= 2 && (
              <button className="fc-wall-btn fc-wall-btn-confirm" onClick={finishWall} aria-label="完成">
                <CheckIcon size={16} />
              </button>
            )}
            <button className="fc-wall-btn fc-wall-btn-undo" onClick={undoLastWallPoint} aria-label="上一步">
              <UndoIcon size={16} />
            </button>
            <button className="fc-wall-btn fc-wall-btn-cancel" onClick={cancelWall} aria-label="取消">
              <CloseIcon size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
