import { getDb } from './db'
import { createId } from '../lib/id'
import type { Device, Floor, MeshGroupLabel, Project } from '../types'

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
  const project: Project = { id: createId(), name, createdAt: now, updatedAt: now }
  await db.put('projects', project)

  const floor: Floor = {
    id: createId(),
    projectId: project.id,
    name: '1F',
    order: 0,
    imageBlob: firstFloorImage,
    scalePxPerMeter: null,
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
  const tx = db.transaction(['projects', 'floors', 'devices'], 'readwrite')
  for (const floor of floors) {
    const devices = await tx.objectStore('devices').index('by-floor').getAllKeys(floor.id)
    for (const deviceId of devices) {
      await tx.objectStore('devices').delete(deviceId)
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
  }
  await db.put('floors', floor)
  await touchProject(projectId)
  return floor
}

export async function updateFloorScale(floorId: string, scalePxPerMeter: number): Promise<void> {
  const db = await getDb()
  const floor = await db.get('floors', floorId)
  if (!floor) return
  floor.scalePxPerMeter = scalePxPerMeter
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
