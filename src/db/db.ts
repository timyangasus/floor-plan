import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Device, Floor, Project, TestClient, Wall } from '../types'

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
  walls: {
    key: string
    value: Wall
    indexes: { 'by-floor': string }
  }
  clients: {
    key: string
    value: TestClient
    indexes: { 'by-floor': string }
  }
}

let dbPromise: Promise<IDBPDatabase<FloorPlanDB>> | null = null

export function getDb(): Promise<IDBPDatabase<FloorPlanDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FloorPlanDB>('floor-plan-pwa', 3, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('projects', { keyPath: 'id' })
          const floors = db.createObjectStore('floors', { keyPath: 'id' })
          floors.createIndex('by-project', 'projectId')
          const devices = db.createObjectStore('devices', { keyPath: 'id' })
          devices.createIndex('by-floor', 'floorId')
        }
        if (oldVersion < 2) {
          const walls = db.createObjectStore('walls', { keyPath: 'id' })
          walls.createIndex('by-floor', 'floorId')
        }
        if (oldVersion < 3) {
          const clients = db.createObjectStore('clients', { keyPath: 'id' })
          clients.createIndex('by-floor', 'floorId')
        }
      },
    })
  }
  return dbPromise
}
