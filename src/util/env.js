// Runtime environment flags: reduced-motion and a coarse device tier for the
// graceful mobile fallback.
export const REDUCED =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function detectTier() {
  if (typeof navigator === 'undefined') return 'high'
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) < 720
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 4
  if ((coarse && small) || cores <= 4 || mem <= 3) return 'low'
  return 'high'
}

export const TIER = typeof window !== 'undefined' ? detectTier() : 'high'
export const LOW = TIER === 'low'
