import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Device, Floor, Project } from '../types'

interface FloorPlanDB extends DBSchema {
  projects: {
    key: string
    value: Project
  }
  floors: {
    key: string
    value: Floor
    indexes: { 'by-project': string }
  }
  devices: {
    key: string
    value: Device
    indexes: { 'by-floor': string }
  }
}

let dbPromise: Promise<IDBPDatabase<FloorPlanDB>> | null = null

export function getDb(): Promise<IDBPDatabase<FloorPlanDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FloorPlanDB>('floor-plan-pwa', 1, {
      upgrade(db) {
        db.createObjectStore('projects', { keyPath: 'id' })
        const floors = db.createObjectStore('floors', { keyPath: 'id' })
        floors.createIndex('by-project', 'projectId')
        const devices = db.createObjectStore('devices', { keyPath: 'id' })
        devices.createIndex('by-floor', 'floorId')
      },
    })
  }
  return dbPromise
}
