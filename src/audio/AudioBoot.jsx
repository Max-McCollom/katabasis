import { useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { startAmbient, setDepth } from './ambient.js'
import { zNear, zFar } from '../world/layout.js'

// Starts ambient audio on the first user gesture (browser autoplay policy) and
// modulates its depth from how far down the hall the camera has travelled.
export default function AudioBoot() {
  const { camera } = useThree()
  useEffect(() => {
    const go = () => startAmbient()
    window.addEventListener('pointerdown', go, { once: true })
    window.addEventListener('keydown', go, { once: true })
    return () => {
      window.removeEventListener('pointerdown', go)
      window.removeEventListener('keydown', go)
    }
  }, [])
  useFrame(() => {
    const k = (zNear - camera.position.z) / (zNear - zFar)
    setDepth(k)
  })
  return null
}
