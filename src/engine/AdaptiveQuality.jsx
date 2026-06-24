import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useQuality } from '../state/quality.js'

// Runtime FPS-based adaptive quality. Lives inside the Canvas. Measures a
// real-time-smoothed FPS and, with hysteresis, steps the quality store down
// when sustained low and back up when sustained high, then re-applies the two
// imperative effects it owns: the renderer pixel-ratio cap and fog density.
//
// It does NOT touch the EffectComposer or the dust: it only flips store.post /
// store.dustMul (via the level actions) and App / Atmosphere consume those
// reactively. Renders nothing and never re-renders (no reactive subscriptions).

const TAU = 1.0 // EMA time constant, seconds (~1s smoothing window)
const WARMUP = 1.5 // ignore the first ~1.5s while the scene settles
const LOW_FPS = 25 // below this, sustained, degrade
const HIGH_FPS = 45 // above this, sustained, recover
const DOWN_HOLD = 1.5 // seconds of sustained-low before stepping down
const UP_HOLD = 4.0 // seconds of sustained-high before stepping up
const WRITE_EVERY = 0.5 // how often (s) to publish fps to the store
const MAX_DELTA = 0.1 // clamp giant frames (tab refocus) so they don't read as ~0fps

export default function AdaptiveQuality() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  const baseFog = useRef(null) // captured ONCE; fog density is always base * fogMul
  const ema = useRef(0) // smoothed FPS
  const age = useRef(0) // total time alive (for warmup)
  const belowTimer = useRef(0) // sustained time with ema < LOW_FPS
  const aboveTimer = useRef(0) // sustained time with ema > HIGH_FPS
  const writeTimer = useRef(0) // time since last store fps write

  // Capture the base fog density exactly once. Re-reading after a multiply has
  // been applied would compound the multiplier.
  useEffect(() => {
    baseFog.current = scene.fog?.density ?? null
  }, [scene])

  // Apply the two imperative effects from the freshest store state. set() is
  // synchronous, so reading getState() right after a step is safe.
  const apply = () => {
    const q = useQuality.getState()
    gl.setPixelRatio(Math.min(window.devicePixelRatio, q.dpr))
    // fog.density is owned by DepthGrade (depth * fogMul); not written here to
    // avoid a double-writer fighting over scene.fog.density.
  }

  useFrame((_state, delta) => {
    // Guard degenerate frames; clamp the high end so a refocus spike (huge
    // delta -> tiny instantaneous fps) cannot trigger a spurious step-down.
    if (delta <= 0) return
    const d = delta > MAX_DELTA ? MAX_DELTA : delta

    // Frame-rate-independent EMA: alpha scales with real time, so the smoothing
    // window is ~TAU seconds regardless of how many frames land inside it.
    const inst = 1 / d
    if (ema.current === 0) {
      ema.current = inst
    } else {
      const alpha = Math.min(1, d / TAU)
      ema.current += (inst - ema.current) * alpha
    }

    age.current += d
    if (age.current < WARMUP) return // keep the EMA warming, but no logic yet

    // Publish the smoothed reading for a HUD / harness on a slow cadence.
    writeTimer.current += d
    if (writeTimer.current >= WRITE_EVERY) {
      writeTimer.current = 0
      useQuality.getState().setFps(Math.round(ema.current))
    }

    const fps = ema.current

    // Two independent sustained-condition timers. The 25..45 dead band resets
    // both, which is the hysteresis that prevents flapping.
    if (fps < LOW_FPS) {
      belowTimer.current += d
      aboveTimer.current = 0
    } else if (fps > HIGH_FPS) {
      aboveTimer.current += d
      belowTimer.current = 0
    } else {
      belowTimer.current = 0
      aboveTimer.current = 0
    }

    if (belowTimer.current >= DOWN_HOLD) {
      belowTimer.current = 0
      aboveTimer.current = 0
      if (useQuality.getState().level < 2) {
        useQuality.getState().stepDown()
        apply()
      }
    } else if (aboveTimer.current >= UP_HOLD) {
      belowTimer.current = 0
      aboveTimer.current = 0
      if (useQuality.getState().level > 0) {
        useQuality.getState().stepUp()
        apply()
      }
    }
  })

  return null
}
