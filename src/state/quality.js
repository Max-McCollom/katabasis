import { create } from 'zustand'

// Runtime adaptive-quality state. A single level table drives every field so the
// three registers cannot drift out of sync. AdaptiveQuality (inside the Canvas)
// measures FPS and calls stepDown/stepUp; App and Atmosphere read these fields
// reactively (post gates the EffectComposer, dpr caps the pixel ratio, fogMul
// shortens draw distance, dustMul thins the dust).
//
//   level 0 : full:   post on,  dpr cap 2,    fog x1,   dust x1
//   level 1 : reduced: post off, dpr cap 1.25, fog x1.2, dust x0.6
//   level 2 : minimal: post off, dpr cap 1,    fog x1.5, dust x0.3
const LEVELS = [
  { post: true, dpr: 2, fogMul: 1, dustMul: 1 },
  { post: false, dpr: 1.25, fogMul: 1.2, dustMul: 0.6 },
  { post: false, dpr: 1, fogMul: 1.5, dustMul: 0.3 },
]

const clamp = (n) => (n < 0 ? 0 : n > 2 ? 2 : n)

export const useQuality = create((set) => ({
  post: LEVELS[0].post, // whether post-processing (bloom/vignette) is on
  dpr: LEVELS[0].dpr, // current device-pixel-ratio cap
  fogMul: LEVELS[0].fogMul, // multiplier on fog density (>1 = shorter draw distance)
  dustMul: LEVELS[0].dustMul, // multiplier on dust count
  fps: 60, // last smoothed FPS reading (for a HUD/harness)
  level: 0, // 0 = full quality, higher = more degraded

  setFps: (fps) => set({ fps }),
  stepDown: () =>
    set((s) => {
      const level = clamp(s.level + 1)
      return { level, ...LEVELS[level] }
    }),
  stepUp: () =>
    set((s) => {
      const level = clamp(s.level - 1)
      return { level, ...LEVELS[level] }
    }),
  setLevel: (n) => {
    const level = clamp(n)
    set({ level, ...LEVELS[level] })
  },
}))
