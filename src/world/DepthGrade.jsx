import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { T } from '../render/treatments.js'
import { useQuality } from '../state/quality.js'

// The Doré progression as space: the deeper the camera descends, the denser the
// fog and the closer the ground falls to true black, with exposure easing down.
// Sole writer of scene.fog.density (AdaptiveQuality multiplies via fogMul).
const trueBlack = new THREE.Color(0x020203)
const baseCol = new THREE.Color(T.fogColor)
const tmp = new THREE.Color()

export default function DepthGrade() {
  const scene = useThree((s) => s.scene)
  const gl = useThree((s) => s.gl)
  useFrame(({ camera }) => {
    const k = THREE.MathUtils.clamp((1.6 - camera.position.y) / 31.6, 0, 1) // 0 hall .. 1 deep
    const fogMul = useQuality.getState().fogMul
    tmp.copy(baseCol).lerp(trueBlack, k * 0.85)
    if (scene.fog) {
      scene.fog.density = T.fogDensity * (1 + k * 1.4) * fogMul
      scene.fog.color.copy(tmp)
    }
    gl.setClearColor(tmp, 1)
    gl.toneMappingExposure = T.exposure * (1 - k * 0.34)
  })
  return null
}
