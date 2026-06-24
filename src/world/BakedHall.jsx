import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

// Loads the Blender-baked hall. The glb carries a COMBINED Cycles bake (albedo
// x candle GI x AO) as its colour map; we render it UNLIT (MeshBasicMaterial) so
// the baked lighting shows as authored, with fog. This is genuine baked GI in
// place of the matcap fake-bounce for the static colonnade.
export default function BakedHall({ url = '/models/hall_draco.glb' }) {
  // Draco-compressed glb (972KB -> 74KB) decoded by the local DRACOLoader.
  const { scene } = useGLTF(url, '/draco/')
  const obj = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((c) => {
      if (c.isMesh) {
        const map = c.material && c.material.map
        if (map) map.colorSpace = THREE.SRGBColorSpace
        c.material = new THREE.MeshBasicMaterial({ map, fog: true, toneMapped: true })
      }
    })
    return root
  }, [scene])
  return <primitive object={obj} />
}

useGLTF.preload('/models/hall_draco.glb', '/draco/')
