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
import ArrivalVeil from './ui/ArrivalVeil.jsx'
import AudioBoot from './audio/AudioBoot.jsx'
import { useUI } from './state/store.js'
import { chapters } from './copy.js'
import { T } from './render/treatments.js'
import { LOW } from './util/env.js'

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
      getCam: () => camera.position.toArray(),
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
      {!HARNESS && <ArrivalVeil />}
      <Canvas
        dpr={LOW ? 1 : [1, 2]}
        gl={{ antialias: !LOW, powerPreference: 'high-performance' }}
        camera={{ position: [0, 1.7, 44], fov: 64, near: 0.1, far: 240 }}
        onCreated={({ scene, gl }) => {
          // low tier: limit draw distance with denser fog so far geometry culls
          scene.fog = new THREE.FogExp2(T.fogColor, LOW ? T.fogDensity * 1.6 : T.fogDensity)
          gl.setClearColor(T.fogColor, 1)
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = T.exposure
        }}
      >
        <Bridge shots={SHOTS} />
        <Hall />
        <Atmosphere />
        {!HARNESS && <AudioBoot />}
        {!HARNESS && (
          <Physics gravity={[0, 0, 0]}>
            <Player />
            <Colliders />
            <Inspectables />
          </Physics>
        )}
        {!LOW && (
          <EffectComposer>
            <Bloom intensity={T.bloom.intensity} luminanceThreshold={T.bloom.threshold} luminanceSmoothing={0.4} mipmapBlur radius={T.bloom.radius} />
            <Vignette offset={0.28} darkness={T.vignette} />
          </EffectComposer>
        )}
      </Canvas>
    </>
  )
}
