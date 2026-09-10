import type { RouterModel } from '../types'

export const routerCatalog: RouterModel[] = [
  { id: 'gt-be98pro', name: 'GT-BE98 Pro', series: 'ROG', generation: 'WiFi 7', txPowerTier: 10 },
  { id: 'gt-be96', name: 'GT-BE96', series: 'ROG', generation: 'WiFi 7', txPowerTier: 9 },
  { id: 'gt-axe16000', name: 'GT-AXE16000', series: 'ROG', generation: 'WiFi 6E', txPowerTier: 9 },
  { id: 'tuf-ax6000', name: 'TUF-AX6000', series: 'TUF', generation: 'WiFi 6', txPowerTier: 7 },
  { id: 'tuf-ax5400', name: 'TUF-AX5400', series: 'TUF', generation: 'WiFi 6', txPowerTier: 6 },
  { id: 'rt-ax88u', name: 'RT-AX88U Pro', series: 'ASUS', generation: 'WiFi 6', txPowerTier: 7 },
  { id: 'rt-ax86u', name: 'RT-AX86U Pro', series: 'ASUS', generation: 'WiFi 6', txPowerTier: 6 },
  { id: 'rt-be96u', name: 'RT-BE96U', series: 'ASUS', generation: 'WiFi 7', txPowerTier: 8 },
  { id: 'ew-ax59', name: 'ExpertWiFi EBA63', series: 'ExpertWiFi', generation: 'WiFi 6', txPowerTier: 6 },
  { id: 'ew-eba63', name: 'ExpertWiFi EBM68', series: 'ExpertWiFi', generation: 'WiFi 6E', txPowerTier: 7 },
  { id: 'zenwifi-xt9', name: 'ZenWiFi XT9', series: 'ZenWiFi', generation: 'WiFi 6', txPowerTier: 7 },
  { id: 'zenwifi-bt10', name: 'ZenWiFi BT10', series: 'ZenWiFi', generation: 'WiFi 7', txPowerTier: 8 },
  { id: 'zenwifi-et9', name: 'ZenWiFi ET9', series: 'ZenWiFi', generation: 'WiFi 6E', txPowerTier: 8 },
  { id: 'proart-pa604', name: 'ProArt PA604', series: 'ProArt', generation: 'WiFi 6E', txPowerTier: 8 },
]

export function getRouterModel(modelId: string): RouterModel | undefined {
  return routerCatalog.find((m) => m.id === modelId)
}

export const routerSeriesList: RouterModel['series'][] = [
  'ROG',
  'TUF',
  'ASUS',
  'ExpertWiFi',
  'ZenWiFi',
  'ProArt',
]

export const wifiGenerationList: RouterModel['generation'][] = ['WiFi 6', 'WiFi 6E', 'WiFi 7']
