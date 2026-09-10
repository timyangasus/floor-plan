import { listDevices, listFloors } from './repository'
import type { Device, Floor } from '../types'

export interface ProjectDeviceEntry {
  device: Device
  floor: Floor
}

export async function listDevicesForProject(projectId: string): Promise<ProjectDeviceEntry[]> {
  const floors = await listFloors(projectId)
  const entries: ProjectDeviceEntry[] = []
  for (const floor of floors) {
    const devices = await listDevices(floor.id)
    for (const device of devices) {
      entries.push({ device, floor })
    }
  }
  return entries
}
