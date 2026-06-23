import React, { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Physics } from '@react-three/rapier'
import { Leva } from 'leva'
import * as THREE from 'three'
import Hall from './world/Hall.jsx'
import Atmosphere from './world/Atmosphere.jsx'
import Player from './engine/Player.jsx'
import Colliders from './engine/Colliders.jsx'
import Inspectables from './inspect/Inspectables.jsx'
import Hud from './ui/Hud.jsx'
import MinigameLayer from './ui/MinigameLayer.jsx'
import { useUI } from './state/store.js'
import { chapters } from './copy.js'

// Harness mode: static scene with a scriptable camera (no controller) so the
// screenshot harness can frame fixed vantages. Live mode: full free-roam.
const HARNESS = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('harness')

function Bridge({ shots }) {
  const { gl, camera } = useThree()
  useEffect(() => {
    const ctx = gl.getContext()
    const dbg = ctx.getExtension('WEBGL_debug_renderer_info')
    const gpu = dbg ? ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'unknown'
    window.__kbx = {
      ready: true,
      gpu,
      isWebGL2: ctx instanceof WebGL2RenderingContext,
      shots,
      setCam: (px, py, pz, tx, ty, tz) => {
        camera.position.set(px, py, pz)
        camera.lookAt(tx, ty, tz)
        camera.updateMatrixWorld()
      },
      // harness hooks for verifying the DOM layers
      demoRead: () => {
        const c = chapters[0]
        useUI.getState().read({ id: c.id, numeral: c.numeral, title: c.title, paragraphs: c.paragraphs })
      },
      launch: (id) => useUI.getState().launch(id || 'astrolabe'),
      clearUI: () => {
        useUI.getState().closeRead()
        useUI.getState().exitGame()
      },
    }
  }, [gl, camera, shots])
  return null
}

const SHOTS = {
  establish: [0, 8, 46, 0, 6, -12],
  eye: [0, 1.7, 40, 0, 5, -22],
  descent: [0, 7, 16, 0, 1, -34],
  detail: [11, 4.5, 28, 0, 6, 22],
}

export default function App() {
  return (
    <>
      <Leva hidden={HARNESS} collapsed />
      <Hud />
      <MinigameLayer />
      <Canvas
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 1.7, 44], fov: 64, near: 0.1, far: 240 }}
        onCreated={({ scene, gl }) => {
          scene.fog = new THREE.FogExp2(0x07060a, 0.02)
          gl.setClearColor(0x07060a, 1)
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
        }}
      >
        <Bridge shots={SHOTS} />
        <Hall />
        <Atmosphere />
        {!HARNESS && (
          <Physics gravity={[0, 0, 0]}>
            <Player />
            <Colliders />
            <Inspectables />
          </Physics>
        )}
        <EffectComposer>
          <Bloom intensity={1.1} luminanceThreshold={0.5} luminanceSmoothing={0.4} mipmapBlur radius={0.7} />
          <Vignette offset={0.28} darkness={0.92} />
        </EffectComposer>
      </Canvas>
    </>
  )
}
