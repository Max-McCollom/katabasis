import React, { useEffect, lazy, Suspense } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Leva } from 'leva'
import * as THREE from 'three'
import Hall from './world/Hall.jsx'
import Descent from './world/Descent.jsx'
import Atmosphere from './world/Atmosphere.jsx'
import DepthGrade from './world/DepthGrade.jsx'
import AdaptiveQuality from './engine/AdaptiveQuality.jsx'
import Hud from './ui/Hud.jsx'

// Code-split: the Rapier-dependent interaction layer (and its WASM) loads after
// first paint, hidden behind the arrival veil. Drops the initial bundle hard.
const PhysicsWorld = lazy(() => import('./engine/PhysicsWorld.jsx'))
import MinigameLayer from './ui/MinigameLayer.jsx'
import ArrivalVeil from './ui/ArrivalVeil.jsx'
import TouchControls from './ui/TouchControls.jsx'
import AudioBoot from './audio/AudioBoot.jsx'
import { useUI } from './state/store.js'
import { useQuality } from './state/quality.js'
import { chapters } from './copy.js'
import { T } from './render/treatments.js'
import { LOW } from './util/env.js'

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
  descent: [0, 2, -29, 0, -11, -50],
  landing: [0, -9, -50, 0, -12, -62],
  shaft: [0, -10.5, -61, 2, -32, -72],
  detail: [11, 4.5, 28, 0, 6, 22],
}

export default function App() {
  const post = useQuality((s) => s.post)
  useEffect(() => {
    if (LOW && !HARNESS) useQuality.getState().stepDown()
  }, [])
  return (
    <>
      <Leva hidden={HARNESS} collapsed />
      <Hud />
      <MinigameLayer />
      {!HARNESS && <ArrivalVeil />}
      {!HARNESS && <TouchControls />}
      <Canvas
        dpr={LOW ? 1 : [1, 2]}
        gl={{ antialias: !LOW, powerPreference: 'high-performance' }}
        camera={{ position: [0, 1.7, 44], fov: 64, near: 0.1, far: 260 }}
        onCreated={({ scene, gl }) => {
          scene.fog = new THREE.FogExp2(T.fogColor, T.fogDensity)
          gl.setClearColor(T.fogColor, 1)
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = T.exposure
        }}
      >
        <Bridge shots={SHOTS} />
        <Hall />
        <Descent />
        <Atmosphere />
        <DepthGrade />
        {!HARNESS && <AudioBoot />}
        {!HARNESS && <AdaptiveQuality />}
        {!HARNESS && (
          <Suspense fallback={null}>
            <PhysicsWorld />
          </Suspense>
        )}
        {post && (
          <EffectComposer>
            <Bloom intensity={T.bloom.intensity} luminanceThreshold={T.bloom.threshold} luminanceSmoothing={0.4} mipmapBlur radius={T.bloom.radius} />
            <Vignette offset={0.28} darkness={T.vignette} />
          </EffectComposer>
        )}
      </Canvas>
    </>
  )
}
