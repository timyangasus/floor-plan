import { getDb } from './db'
import { createId } from '../lib/id'
import type { Device, Floor, MeshGroupLabel, Project, TestClient, Wall } from '../types'
import { LITE_PX_PER_METER } from '../data/liteTemplates'

// --- Projects ---

export async function listProjects(): Promise<Project[]> {
  const db = await getDb()
  const all = await db.getAll('projects')
  return all.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await getDb()
  return db.get('projects', id)
}

export async function createProject(name: string, firstFloorImage: Blob | null): Promise<Project> {
  const db = await getDb()
  const now = Date.now()
  const project: Project = { id: createId(), name, createdAt: now, updatedAt: now, kind: 'full' }
  await db.put('projects', project)

  const floor: Floor = {
    id: createId(),
    projectId: project.id,
    name: '1F',
    order: 0,
    imageBlob: firstFloorImage,
    scalePxPerMeter: null,
    calibrationLine: null,
    templateId: null,
  }
  await db.put('floors', floor)

  return project
}

export async function createLiteProject(name: string, templateId: string): Promise<Project> {
  const db = await getDb()
  const now = Date.now()
  const project: Project = { id: createId(), name, createdAt: now, updatedAt: now, kind: 'lite' }
  await db.put('projects', project)

  const floor: Floor = {
    id: createId(),
    projectId: project.id,
    name: '1F',
    order: 0,
    imageBlob: null,
    scalePxPerMeter: LITE_PX_PER_METER,
    calibrationLine: null,
    templateId,
  }
  await db.put('floors', floor)

  return project
}

export async function renameProject(id: string, name: string): Promise<void> {
  const db = await getDb()
  const project = await db.get('projects', id)
  if (!project) return
  project.name = name
  project.updatedAt = Date.now()
  await db.put('projects', project)
}

export async function touchProject(id: string): Promise<void> {
  const db = await getDb()
  const project = await db.get('projects', id)
  if (!project) return
  project.updatedAt = Date.now()
  await db.put('projects', project)
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDb()
  const floors = await db.getAllFromIndex('floors', 'by-project', id)
  const tx = db.transaction(['projects', 'floors', 'devices', 'walls', 'clients'], 'readwrite')
  for (const floor of floors) {
    const devices = await tx.objectStore('devices').index('by-floor').getAllKeys(floor.id)
    for (const deviceId of devices) {
      await tx.objectStore('devices').delete(deviceId)
    }
    const walls = await tx.objectStore('walls').index('by-floor').getAllKeys(floor.id)
    for (const wallId of walls) {
      await tx.objectStore('walls').delete(wallId)
    }
    const clients = await tx.objectStore('clients').index('by-floor').getAllKeys(floor.id)
    for (const clientId of clients) {
      await tx.objectStore('clients').delete(clientId)
    }
    await tx.objectStore('floors').delete(floor.id)
  }
  await tx.objectStore('projects').delete(id)
  await tx.done
}

// --- Floors ---

export async function listFloors(projectId: string): Promise<Floor[]> {
  const db = await getDb()
  const floors = await db.getAllFromIndex('floors', 'by-project', projectId)
  return floors.sort((a, b) => a.order - b.order)
}

export async function getFloor(id: string): Promise<Floor | undefined> {
  const db = await getDb()
  return db.get('floors', id)
}

export async function addFloor(projectId: string, name: string, imageBlob: Blob | null): Promise<Floor> {
  const db = await getDb()
  const existing = await listFloors(projectId)
  const floor: Floor = {
    id: createId(),
    projectId,
    name,
    order: existing.length,
    imageBlob,
    scalePxPerMeter: null,
    calibrationLine: null,
    templateId: null,
  }
  await db.put('floors', floor)
  await touchProject(projectId)
  return floor
}

export async function updateFloorScale(
  floorId: string,
  scalePxPerMeter: number,
  calibrationLine: { a: { x: number; y: number }; b: { x: number; y: number } } | null,
): Promise<void> {
  const db = await getDb()
  const floor = await db.get('floors', floorId)
  if (!floor) return
  floor.scalePxPerMeter = scalePxPerMeter
  floor.calibrationLine = calibrationLine
  await db.put('floors', floor)
}

export async function updateFloorTemplate(floorId: string, templateId: string): Promise<void> {
  const db = await getDb()
  const floor = await db.get('floors', floorId)
  if (!floor) return
  floor.templateId = templateId
  floor.scalePxPerMeter = LITE_PX_PER_METER
  await db.put('floors', floor)
}

// --- Devices ---

export async function listDevices(floorId: string): Promise<Device[]> {
  const db = await getDb()
  return db.getAllFromIndex('devices', 'by-floor', floorId)
}

export async function placeDevice(
  floorId: string,
  modelId: string,
  x: number,
  y: number,
): Promise<Device> {
  const db = await getDb()
  const device: Device = {
    id: createId(),
    floorId,
    modelId,
    x,
    y,
    rotation: 0,
    groupLabel: null,
    isCap: false,
    name: null,
    heightMeters: 0,
  }
  await db.put('devices', device)
  return device
}

export async function updateDevice(device: Device): Promise<void> {
  const db = await getDb()
  await db.put('devices', device)
}

export async function deleteDevice(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('devices', id)
}

export async function assignDeviceGroup(
  id: string,
  groupLabel: MeshGroupLabel | null,
): Promise<void> {
  const db = await getDb()
  const device = await db.get('devices', id)
  if (!device) return
  device.groupLabel = groupLabel
  if (!groupLabel) device.isCap = false
  await db.put('devices', device)
}

export async function replaceDevicesForFloor(floorId: string, devices: Device[]): Promise<void> {
  const db = await getDb()
  const tx = db.transaction('devices', 'readwrite')
  const store = tx.objectStore('devices')
  const existingKeys = await store.index('by-floor').getAllKeys(floorId)
  for (const key of existingKeys) {
    await store.delete(key)
  }
  for (const device of devices) {
    await store.put(device)
  }
  await tx.done
}

export async function setDeviceCap(id: string, isCap: boolean): Promise<void> {
  const db = await getDb()
  const device = await db.get('devices', id)
  if (!device) return
  if (isCap && device.groupLabel) {
    const groupDevices = await db.getAllFromIndex('devices', 'by-floor', device.floorId)
    for (const other of groupDevices) {
      if (other.id !== id && other.groupLabel === device.groupLabel && other.isCap) {
        other.isCap = false
        await db.put('devices', other)
      }
    }
  }
  device.isCap = isCap
  await db.put('devices', device)
}

// --- Walls ---

export async function listWalls(floorId: string): Promise<Wall[]> {
  const db = await getDb()
  return db.getAllFromIndex('walls', 'by-floor', floorId)
}

export async function createWall(
  floorId: string,
  points: { x: number; y: number }[],
  materialId: string,
): Promise<Wall> {
  const db = await getDb()
  const wall: Wall = { id: createId(), floorId, points, materialId }
  await db.put('walls', wall)
  return wall
}

export async function deleteWall(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('walls', id)
}

// --- Test clients ---

export async function listClients(floorId: string): Promise<TestClient[]> {
  const db = await getDb()
  return db.getAllFromIndex('clients', 'by-floor', floorId)
}

export async function createClient(floorId: string, x: number, y: number): Promise<TestClient> {
  const db = await getDb()
  const client: TestClient = {
    id: createId(),
    floorId,
    x,
    y,
    clientTypeId: 'wifi6-phone',
    bandwidthMHz: 20,
  }
  await db.put('clients', client)
  return client
}

export async function updateClient(client: TestClient): Promise<void> {
  const db = await getDb()
  await db.put('clients', client)
}

export async function deleteClient(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('clients', id)
}
