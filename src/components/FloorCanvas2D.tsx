import { useEffect, useRef, useState } from 'react'
import type { Band, Device } from '../types'
import { getRouterModel } from '../data/routerCatalog'
import { bestSignalDbm, distanceInMeters, signalToStrength, strengthToColor } from '../lib/signalModel'
import { RouterIcon } from './icons'
import './FloorCanvas2D.css'

export type CanvasMode = 'select' | 'pan' | 'place' | 'calibrate'

interface Transform {
  scale: number
  tx: number
  ty: number
}

interface Props {
  imageUrl: string | null
  naturalSize: { width: number; height: number } | null
  onNaturalSize: (size: { width: number; height: number }) => void
  devices: Device[]
  mode: CanvasMode
  transform: Transform
  onTransformChange: (t: Transform) => void
  onPlaceAt: (x: number, y: number) => void
  onSelectDevice: (id: string | null) => void
  onMoveDevice: (id: string, x: number, y: number) => void
  onDeviceDragStart: (id: string) => void
  onDeviceDragEnd: (id: string) => void
  selectedDeviceId: string | null
  showHeatmap: boolean
  showGrid: boolean
  band: Band
  scalePxPerMeter: number | null
  onCalibratePoints: (a: { x: number; y: number }, b: { x: number; y: number }) => void
}

export default function FloorCanvas2D({
  imageUrl,
  naturalSize,
  onNaturalSize,
  devices,
  mode,
  transform,
  onTransformChange,
  onPlaceAt,
  onSelectDevice,
  onMoveDevice,
  onDeviceDragStart,
  onDeviceDragEnd,
  selectedDeviceId,
  showHeatmap,
  showGrid,
  band,
  scalePxPerMeter,
  onCalibratePoints,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const draggingDeviceId = useRef<string | null>(null)
  const panState = useRef<{ x: number; y: number } | null>(null)
  const dragMoved = useRef(false)
  const [calibrationFirstPoint, setCalibrationFirstPoint] = useState<{ x: number; y: number } | null>(
    null,
  )

  function screenToContent(clientX: number, clientY: number) {
    const rect = containerRef.current!.getBoundingClientRect()
    const sx = clientX - rect.left
    const sy = clientY - rect.top
    return {
      x: (sx - transform.tx) / transform.scale,
      y: (sy - transform.ty) / transform.scale,
    }
  }

  function handleBackgroundPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('.fc-device')) return
    const point = screenToContent(e.clientX, e.clientY)

    if (mode === 'place') {
      onPlaceAt(point.x, point.y)
      return
    }
    if (mode === 'calibrate') {
      if (!calibrationFirstPoint) {
        setCalibrationFirstPoint(point)
      } else {
        onCalibratePoints(calibrationFirstPoint, point)
        setCalibrationFirstPoint(null)
      }
      return
    }
    if (mode === 'pan' || mode === 'select') {
      onSelectDevice(null)
      panState.current = { x: e.clientX, y: e.clientY }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (draggingDeviceId.current) {
      dragMoved.current = true
      const point = screenToContent(e.clientX, e.clientY)
      onMoveDevice(draggingDeviceId.current, point.x, point.y)
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
    if (draggingDeviceId.current && dragMoved.current) {
      onDeviceDragEnd(draggingDeviceId.current)
    }
    draggingDeviceId.current = null
    panState.current = null
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* no-op */
    }
  }

  function handleDevicePointerDown(e: React.PointerEvent, deviceId: string) {
    if (mode !== 'select') return
    e.stopPropagation()
    dragMoved.current = false
    draggingDeviceId.current = deviceId
    onSelectDevice(deviceId)
    onDeviceDragStart(deviceId)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !naturalSize || !showHeatmap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = naturalSize.width
    canvas.height = naturalSize.height

    const pxPerMeter = scalePxPerMeter ?? 60
    const step = Math.max(8, Math.round(naturalSize.width / 120))
    const withModels = devices
      .map((d) => ({ d, model: getRouterModel(d.modelId) }))
      .filter((x) => x.model)

    const imageData = ctx.createImageData(naturalSize.width, naturalSize.height)
    for (let y = 0; y < naturalSize.height; y += step) {
      for (let x = 0; x < naturalSize.width; x += step) {
        let dbm = -95
        if (withModels.length > 0) {
          dbm = bestSignalDbm(
            withModels.map(({ d, model }) => ({
              distanceMeters: distanceInMeters({ x, y }, d, pxPerMeter),
              txPowerTier: model!.txPowerTier,
            })),
            band,
          )
        }
        const strength = signalToStrength(dbm)
        const [r, g, b] = strengthToColor(strength)
        const alpha = withModels.length > 0 ? Math.round(120 + strength * 60) : 0

        for (let yy = 0; yy < step && y + yy < naturalSize.height; yy++) {
          for (let xx = 0; xx < step && x + xx < naturalSize.width; xx++) {
            const idx = ((y + yy) * naturalSize.width + (x + xx)) * 4
            imageData.data[idx] = r
            imageData.data[idx + 1] = g
            imageData.data[idx + 2] = b
            imageData.data[idx + 3] = alpha
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }, [devices, naturalSize, showHeatmap, band, scalePxPerMeter])

  return (
    <div
      ref={containerRef}
      className={`fc-container fc-mode-${mode}`}
      onPointerDown={handleBackgroundPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="fc-content"
        style={{
          transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
          width: naturalSize?.width ?? 0,
          height: naturalSize?.height ?? 0,
        }}
      >
        {imageUrl && (
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
        )}

        {showHeatmap && <canvas ref={canvasRef} className="fc-heatmap" />}

        {showGrid && naturalSize && (
          <div
            className="fc-grid"
            style={{
              backgroundSize: `${scalePxPerMeter ?? 50}px ${scalePxPerMeter ?? 50}px`,
            }}
          />
        )}

        {calibrationFirstPoint && (
          <div
            className="fc-calibration-point"
            style={{ left: calibrationFirstPoint.x, top: calibrationFirstPoint.y }}
          />
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
      </div>
    </div>
  )
}
