import { Suspense } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Device } from '../types'
import './Floor3DView.css'

interface Props {
  imageUrl: string | null
  naturalSize: { width: number; height: number } | null
  devices: Device[]
  scalePxPerMeter: number | null
}

function FloorPlane({ imageUrl, widthM, depthM }: { imageUrl: string; widthM: number; depthM: number }) {
  const texture = useLoader(THREE.TextureLoader, imageUrl)
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[widthM, depthM]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function RouterMarker({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.4, z]}>
      <mesh castShadow>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        <meshStandardMaterial color="#1a56db" />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <coneGeometry args={[0.28, 0.5, 4]} />
        <meshStandardMaterial color="#1a56db" wireframe />
      </mesh>
    </group>
  )
}

export default function Floor3DView({ imageUrl, naturalSize, devices, scalePxPerMeter }: Props) {
  if (!imageUrl || !naturalSize) {
    return <div className="floor3d-empty">尚未設定平面圖。</div>
  }

  const pxPerMeter = scalePxPerMeter ?? 60
  const widthM = naturalSize.width / pxPerMeter
  const depthM = naturalSize.height / pxPerMeter
  const span = Math.max(widthM, depthM)

  function toWorld(device: Device): [number, number] {
    const x = device.x / pxPerMeter - widthM / 2
    const z = device.y / pxPerMeter - depthM / 2
    return [x, z]
  }

  return (
    <div className="floor3d-container">
      <Canvas shadows camera={{ position: [span * 0.9, span * 1.3, span * 1.3], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 3]} intensity={0.9} castShadow />
        <Suspense fallback={null}>
          <FloorPlane imageUrl={imageUrl} widthM={widthM} depthM={depthM} />
        </Suspense>
        {devices.map((device) => {
          const [x, z] = toWorld(device)
          return <RouterMarker key={device.id} x={x} z={z} />
        })}
        <OrbitControls makeDefault minDistance={1} maxDistance={Math.max(widthM, depthM) * 3} />
      </Canvas>
    </div>
  )
}
