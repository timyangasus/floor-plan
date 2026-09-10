export interface ClientType {
  id: string
  name: string
  mimo: 1 | 2
  /** Flat dB bonus applied to received signal — a newer/better antenna pulls out a usable link from a weaker raw signal. Purely a simulation knob, not a real spec. */
  sensitivityBonusDb: number
}

export const clientTypes: ClientType[] = [
  { id: 'wifi6-phone', name: 'WiFi 6 手機', mimo: 2, sensitivityBonusDb: 0 },
  { id: 'wifi6e-phone', name: 'WiFi 6E 手機', mimo: 2, sensitivityBonusDb: 1 },
  { id: 'wifi5-laptop', name: 'WiFi 5 筆電', mimo: 2, sensitivityBonusDb: -1 },
  { id: 'wifi6-laptop', name: 'WiFi 6 筆電', mimo: 2, sensitivityBonusDb: 1 },
  { id: 'iot-device', name: 'IoT 裝置', mimo: 1, sensitivityBonusDb: -3 },
]

export function getClientType(id: string): ClientType {
  return clientTypes.find((t) => t.id === id) ?? clientTypes[0]
}

export type TestClientBandwidth = 20 | 40 | 80 | 160

export const bandwidthOptions: TestClientBandwidth[] = [20, 40, 80, 160]
