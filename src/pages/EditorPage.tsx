import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FloorCanvas2D, { type CanvasMode } from '../components/FloorCanvas2D'

const Floor3DView = lazy(() => import('../components/Floor3DView'))
import EditorTopBar from '../components/EditorTopBar'
import EditorSideControls from '../components/EditorSideControls'
import EditorBottomToolbar from '../components/EditorBottomToolbar'
import WifiLegend from '../components/WifiLegend'
import DeviceCatalogSheet from '../components/DeviceCatalogSheet'
import EditorMenuDrawer from '../components/EditorMenuDrawer'
import EditorLayersSheet from '../components/EditorLayersSheet'
import ProjectSettingsModal from '../components/ProjectSettingsModal'
import ScaleCalibrationModal from '../components/ScaleCalibrationModal'
import WallMaterialSheet from '../components/WallMaterialSheet'
import ClientInspectorSheet from '../components/ClientInspectorSheet'
import {
  addFloor,
  createClient,
  createWall,
  deleteClient,
  deleteDevice,
  deleteWall,
  getFloor,
  getProject,
  listClients,
  listDevices,
  listFloors,
  listWalls,
  placeDevice,
  renameProject,
  replaceDevicesForFloor,
  updateClient,
  updateDevice,
  updateFloorScale,
} from '../db/repository'
import type { Band, Device, Floor, Project, RouterModel, TestClient, Wall } from '../types'
import type { ViewMode } from './EditorPage.types'
import { useObjectUrl } from '../lib/useObjectUrl'
import { applyTheme, loadTheme, saveTheme, type ThemeMode } from '../lib/theme'
import { getRouterModel } from '../data/routerCatalog'
import { getWallMaterial } from '../data/wallMaterials'
import { getClientType } from '../data/clientTypes'
import { bestRouterConnection, estimateRateMbps } from '../lib/signalModel'
import { RotateIcon, TrashIcon } from '../components/icons'
import './EditorPage.css'

interface HistoryState {
  past: Device[][]
  future: Device[][]
}

export default function EditorPage() {
  const { projectId, floorId } = useParams<{ projectId: string; floorId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [floor, setFloor] = useState<Floor | null>(null)
  const [floors, setFloors] = useState<Floor[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [walls, setWalls] = useState<Wall[]>([])
  const [clients, setClients] = useState<TestClient[]>([])
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)

  const [view, setView] = useState<ViewMode>('2d')
  const [mode, setMode] = useState<CanvasMode>('select')
  const [transform, setTransform] = useState({ scale: 1, tx: 0, ty: 0 })
  const [pendingModel, setPendingModel] = useState<RouterModel | null>(null)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [wallDrawMaterialId, setWallDrawMaterialId] = useState<string | null>(null)
  const [band, setBand] = useState<Band>('2.4')

  const [menuOpen, setMenuOpen] = useState(false)
  const [layersOpen, setLayersOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [wallMaterialOpen, setWallMaterialOpen] = useState(false)
  const [calibrationPending, setCalibrationPending] = useState<{
    a: { x: number; y: number }
    b: { x: number; y: number }
  } | null>(null)
  const [theme, setTheme] = useState<ThemeMode>('system')

  const [history, setHistory] = useState<HistoryState>({ past: [], future: [] })
  const dragSnapshotRef = useRef<Device[] | null>(null)
  const canvasAreaRef = useRef<HTMLDivElement>(null)

  const imageUrl = useObjectUrl(floor?.imageBlob ?? null)

  useEffect(() => {
    setTheme(loadTheme())
    load()
  }, [projectId, floorId])

  async function load() {
    if (!projectId || !floorId) return
    const [p, f, fl, d, w, c] = await Promise.all([
      getProject(projectId),
      getFloor(floorId),
      listFloors(projectId),
      listDevices(floorId),
      listWalls(floorId),
      listClients(floorId),
    ])
    if (!p || !f) {
      navigate('/home')
      return
    }
    setProject(p)
    setFloor(f)
    setFloors(fl)
    setDevices(d)
    setWalls(w)
    setClients(c)
    setNaturalSize(null)
    setHistory({ past: [], future: [] })
    setSelectedDeviceId(null)
    setSelectedWallId(null)
    setSelectedClientId(null)
    setMode('select')
  }

  function pushHistory(snapshot: Device[]) {
    setHistory((h) => ({ past: [...h.past, snapshot], future: [] }))
  }

  function centerView() {
    if (!naturalSize || !canvasAreaRef.current) return
    const rect = canvasAreaRef.current.getBoundingClientRect()
    const scale = Math.min(rect.width / naturalSize.width, rect.height / naturalSize.height) * 0.92
    const tx = (rect.width - naturalSize.width * scale) / 2
    const ty = (rect.height - naturalSize.height * scale) / 2
    setTransform({ scale, tx, ty })
  }

  useEffect(() => {
    if (naturalSize) centerView()
  }, [naturalSize])

  function zoomBy(factor: number) {
    if (!canvasAreaRef.current) return
    const rect = canvasAreaRef.current.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const newScale = Math.min(4, Math.max(0.15, transform.scale * factor))
    const contentX = (cx - transform.tx) / transform.scale
    const contentY = (cy - transform.ty) / transform.scale
    setTransform({
      scale: newScale,
      tx: cx - newScale * contentX,
      ty: cy - newScale * contentY,
    })
  }

  async function handlePlaceAt(x: number, y: number) {
    if (!pendingModel || !floorId) return
    const prevSnapshot = devices
    const created = await placeDevice(floorId, pendingModel.id, x, y)
    setDevices((prev) => [...prev, created])
    pushHistory(prevSnapshot)
    setSelectedDeviceId(created.id)
  }

  function finishPlacing() {
    setPendingModel(null)
    setMode('select')
  }

  function handleMoveDevice(id: string, x: number, y: number) {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, x, y } : d)))
  }

  function handleDeviceDragStart(id: string) {
    dragSnapshotRef.current = devices
    void id
  }

  async function handleDeviceDragEnd(id: string) {
    if (dragSnapshotRef.current) {
      pushHistory(dragSnapshotRef.current)
      dragSnapshotRef.current = null
    }
    const device = devices.find((d) => d.id === id)
    if (device) await updateDevice(device)
  }

  async function handleRotateSelected() {
    if (!selectedDeviceId) return
    const device = devices.find((d) => d.id === selectedDeviceId)
    if (!device) return
    const prevSnapshot = devices
    const updated = { ...device, rotation: (device.rotation + 45) % 360 }
    await updateDevice(updated)
    setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    pushHistory(prevSnapshot)
  }

  async function handleDeleteSelected() {
    if (!selectedDeviceId) return
    const prevSnapshot = devices
    await deleteDevice(selectedDeviceId)
    setDevices((prev) => prev.filter((d) => d.id !== selectedDeviceId))
    pushHistory(prevSnapshot)
    setSelectedDeviceId(null)
  }

  async function handleUndo() {
    if (history.past.length === 0 || !floorId) return
    const previous = history.past[history.past.length - 1]
    setHistory((h) => ({ past: h.past.slice(0, -1), future: [devices, ...h.future] }))
    setDevices(previous)
    setSelectedDeviceId(null)
    await replaceDevicesForFloor(floorId, previous)
  }

  async function handleRedo() {
    if (history.future.length === 0 || !floorId) return
    const next = history.future[0]
    setHistory((h) => ({ past: [...h.past, devices], future: h.future.slice(1) }))
    setDevices(next)
    setSelectedDeviceId(null)
    await replaceDevicesForFloor(floorId, next)
  }

  function handleCalibratePoints(a: { x: number; y: number }, b: { x: number; y: number }) {
    setCalibrationPending({ a, b })
  }

  async function handleConfirmCalibration(meters: number) {
    if (!calibrationPending || !floorId) return
    const dx = calibrationPending.a.x - calibrationPending.b.x
    const dy = calibrationPending.a.y - calibrationPending.b.y
    const pixelDistance = Math.sqrt(dx * dx + dy * dy)
    const scalePxPerMeter = pixelDistance / meters
    await updateFloorScale(floorId, scalePxPerMeter)
    setFloor((prev) => (prev ? { ...prev, scalePxPerMeter } : prev))
    setCalibrationPending(null)
    setMode('select')
  }

  function calibrationPixelDistance() {
    if (!calibrationPending) return 0
    const dx = calibrationPending.a.x - calibrationPending.b.x
    const dy = calibrationPending.a.y - calibrationPending.b.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  async function handleAddFloor(file: File | null) {
    if (!projectId) return
    const name = `${floors.length + 1}F`
    const created = await addFloor(projectId, name, file)
    setLayersOpen(false)
    navigate(`/project/${projectId}/floor/${created.id}`)
  }

  function selectDevice(id: string | null) {
    setSelectedDeviceId(id)
    if (id) {
      setSelectedWallId(null)
      setSelectedClientId(null)
    }
  }

  function selectWall(id: string | null) {
    setSelectedWallId(id)
    if (id) {
      setSelectedDeviceId(null)
      setSelectedClientId(null)
    }
  }

  function selectClient(id: string | null) {
    setSelectedClientId(id)
    if (id) {
      setSelectedDeviceId(null)
      setSelectedWallId(null)
    }
  }

  async function handleAddClient() {
    if (!floorId) return
    const rect = canvasAreaRef.current?.getBoundingClientRect()
    const center =
      rect && naturalSize
        ? {
            x: (rect.width / 2 - transform.tx) / transform.scale,
            y: (rect.height / 2 - transform.ty) / transform.scale,
          }
        : { x: (naturalSize?.width ?? 0) / 2, y: (naturalSize?.height ?? 0) / 2 }
    const created = await createClient(floorId, center.x, center.y)
    setClients((prev) => [...prev, created])
    setMode('select')
  }

  function handleMoveClient(id: string, x: number, y: number) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, x, y } : c)))
  }

  function handleClientDragStart(_id: string) {
    // no undo history for test clients — dragging just repositions and re-persists on drop
  }

  async function handleClientDragEnd(id: string) {
    const client = clients.find((c) => c.id === id)
    if (client) await updateClient(client)
  }

  async function handleDeleteClient() {
    if (!selectedClientId) return
    await deleteClient(selectedClientId)
    setClients((prev) => prev.filter((c) => c.id !== selectedClientId))
    setSelectedClientId(null)
  }

  async function handleChangeClientType(clientTypeId: string) {
    const client = clients.find((c) => c.id === selectedClientId)
    if (!client) return
    const updated = { ...client, clientTypeId }
    await updateClient(updated)
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  async function handleChangeClientBandwidth(bandwidthMHz: 20 | 40 | 80 | 160) {
    const client = clients.find((c) => c.id === selectedClientId)
    if (!client) return
    const updated = { ...client, bandwidthMHz }
    await updateClient(updated)
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  function handlePickWallMaterial(materialId: string) {
    setWallDrawMaterialId(materialId)
    setWallMaterialOpen(false)
    setMode('draw-wall')
  }

  async function handleWallComplete(points: { x: number; y: number }[]) {
    if (!floorId || !wallDrawMaterialId) return
    const created = await createWall(floorId, points, wallDrawMaterialId)
    setWalls((prev) => [...prev, created])
  }

  async function handleDeleteWall() {
    if (!selectedWallId) return
    await deleteWall(selectedWallId)
    setWalls((prev) => prev.filter((w) => w.id !== selectedWallId))
    setSelectedWallId(null)
  }

  async function handleRenameProject(name: string) {
    if (!projectId) return
    await renameProject(projectId, name)
    setProject((prev) => (prev ? { ...prev, name } : prev))
  }

  function toggleTheme() {
    const next: ThemeMode = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
    setTheme(next)
    saveTheme(next)
    applyTheme(next)
  }

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) ?? null
  const selectedModel = selectedDevice ? getRouterModel(selectedDevice.modelId) : null
  const selectedWall = walls.find((w) => w.id === selectedWallId) ?? null
  const selectedWallMaterial = selectedWall ? getWallMaterial(selectedWall.materialId) : null
  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null

  const routerCandidates = devices
    .map((d) => {
      const model = getRouterModel(d.modelId)
      return model ? { id: d.id, x: d.x, y: d.y, txPowerTier: model.txPowerTier } : null
    })
    .filter((c): c is { id: string; x: number; y: number; txPowerTier: number } => c !== null)

  const selectedClientConnection = (() => {
    if (!selectedClient || !floor) return null
    const clientType = getClientType(selectedClient.clientTypeId)
    const connection = bestRouterConnection(
      selectedClient,
      routerCandidates,
      walls,
      floor.scalePxPerMeter ?? 60,
      band,
      clientType.sensitivityBonusDb,
    )
    if (!connection) return null
    const routerDevice = devices.find((d) => d.id === connection.routerId)
    const routerModel = routerDevice ? getRouterModel(routerDevice.modelId) : null
    return {
      routerName: routerModel?.name ?? '未知裝置',
      floorName: floor.name,
      distanceMeters: connection.distanceMeters,
      dbm: connection.dbm,
      rateMbps: estimateRateMbps(connection.dbm, selectedClient.bandwidthMHz, clientType.mimo),
      mimo: clientType.mimo,
    }
  })()

  if (!project || !floor) {
    return <div className="editor-loading">載入中…</div>
  }

  return (
    <div className="editor-page">
      <EditorTopBar
        onMenu={() => setMenuOpen(true)}
        onEditProject={() => setSettingsOpen(true)}
        onLayers={() => setLayersOpen(true)}
        view={view}
        onViewChange={setView}
      />

      <div className="editor-canvas-area" ref={canvasAreaRef}>
        {view === '2d' ? (
          <FloorCanvas2D
            imageUrl={imageUrl}
            naturalSize={naturalSize}
            onNaturalSize={setNaturalSize}
            devices={devices}
            walls={walls}
            selectedWallId={selectedWallId}
            onSelectWall={selectWall}
            onWallComplete={handleWallComplete}
            clients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={selectClient}
            onMoveClient={handleMoveClient}
            onClientDragStart={handleClientDragStart}
            onClientDragEnd={handleClientDragEnd}
            mode={mode}
            transform={transform}
            onTransformChange={setTransform}
            onPlaceAt={handlePlaceAt}
            onSelectDevice={selectDevice}
            onMoveDevice={handleMoveDevice}
            onDeviceDragStart={handleDeviceDragStart}
            onDeviceDragEnd={handleDeviceDragEnd}
            selectedDeviceId={selectedDeviceId}
            band={band}
            scalePxPerMeter={floor.scalePxPerMeter}
            onCalibratePoints={handleCalibratePoints}
          />
        ) : (
          <Suspense fallback={<div className="editor-loading">載入 3D 檢視…</div>}>
            <Floor3DView
              imageUrl={imageUrl}
              naturalSize={naturalSize}
              devices={devices}
              scalePxPerMeter={floor.scalePxPerMeter}
            />
          </Suspense>
        )}

        {view === '2d' && floor.scalePxPerMeter === null && mode === 'select' && (
          <div className="calibration-banner">
            <span>請先設定平面圖比例尺，覆蓋範圍才會準確。</span>
            <button onClick={() => setMode('calibrate')}>設定比例尺</button>
          </div>
        )}

        {view === '2d' && mode === 'calibrate' && (
          <div className="calibration-hint">在平面圖上點兩下，標記一段已知實際距離的兩個點</div>
        )}

        {view === '2d' && mode === 'place' && pendingModel && (
          <div className="calibration-banner">
            <span>在平面圖上放置「{pendingModel.name}」。</span>
            <button onClick={finishPlacing}>完成</button>
          </div>
        )}

        {view === '2d' && (
          <div className="editor-bottom-panels">
            <WifiLegend band={band} onBandChange={setBand} />

            {selectedDevice && (
              <div className="device-inspector">
                <span className="device-inspector-name">{selectedModel?.name ?? selectedDevice.modelId}</span>
                <div className="device-inspector-actions">
                  <button className="icon-btn" onClick={handleRotateSelected} aria-label="旋轉">
                    <RotateIcon />
                  </button>
                  <button className="icon-btn" onClick={handleDeleteSelected} aria-label="刪除">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )}

            {selectedWall && (
              <div className="device-inspector">
                <span className="device-inspector-name">
                  {selectedWallMaterial?.name ?? selectedWall.materialId}
                  {selectedWallMaterial && `・${selectedWallMaterial.dbAt5GHz} dB`}
                </span>
                <div className="device-inspector-actions">
                  <button className="icon-btn" onClick={handleDeleteWall} aria-label="刪除">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === '2d' && (
          <EditorSideControls
            onZoomIn={() => zoomBy(1.2)}
            onZoomOut={() => zoomBy(1 / 1.2)}
            onCenter={centerView}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={history.past.length > 0}
            canRedo={history.future.length > 0}
          />
        )}

        {view === '2d' && (
          <EditorBottomToolbar
            mode={mode}
            onModeChange={(m) => {
              if (mode === 'place' && m !== 'place') setPendingModel(null)
              setMode(m)
              if (m === 'place') setCatalogOpen(true)
            }}
            onOpenWallMaterial={() => setWallMaterialOpen(true)}
            onAddClient={handleAddClient}
            onOpenTopology={() => navigate(`/project/${projectId}/topology`)}
          />
        )}
      </div>

      {catalogOpen && (
        <DeviceCatalogSheet
          onClose={() => {
            setCatalogOpen(false)
            if (!pendingModel) setMode('select')
          }}
          onPick={(model) => {
            setPendingModel(model)
            setCatalogOpen(false)
            setMode('place')
          }}
        />
      )}

      {menuOpen && (
        <EditorMenuDrawer
          onClose={() => setMenuOpen(false)}
          projectId={project.id}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {layersOpen && (
        <EditorLayersSheet
          floors={floors}
          currentFloorId={floor.id}
          projectId={project.id}
          onClose={() => setLayersOpen(false)}
          onAddFloor={handleAddFloor}
        />
      )}

      {settingsOpen && (
        <ProjectSettingsModal
          initialName={project.name}
          onClose={() => setSettingsOpen(false)}
          onSave={handleRenameProject}
        />
      )}

      {wallMaterialOpen && (
        <WallMaterialSheet onClose={() => setWallMaterialOpen(false)} onPick={handlePickWallMaterial} />
      )}

      {selectedClient && (
        <ClientInspectorSheet
          client={selectedClient}
          connection={selectedClientConnection}
          onClose={() => setSelectedClientId(null)}
          onDelete={handleDeleteClient}
          onChangeType={handleChangeClientType}
          onChangeBandwidth={handleChangeClientBandwidth}
        />
      )}

      {calibrationPending && (
        <ScaleCalibrationModal
          pixelDistance={calibrationPixelDistance()}
          onCancel={() => {
            setCalibrationPending(null)
          }}
          onConfirm={handleConfirmCalibration}
        />
      )}
    </div>
  )
}
