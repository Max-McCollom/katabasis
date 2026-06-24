// Three distinct visual treatments of the same hall, chosen by ?treatment=ID.
// Different lighting / mood / density for Max to pick a direction. Read once at
// load so builders can consume it without prop threading.

const TREATMENTS = {
  // Candlelit gold: warm, balanced, the Doré "above" register made present.
  gold: {
    fogDensity: 0.02,
    fogColor: 0x07060a,
    exposure: 1.05,
    bloom: { intensity: 1.1, threshold: 0.5, radius: 0.7 },
    vignette: 0.92,
    candle: { warm: '#ff9436', range: 7.5, strength: 2.6 },
    shaft: { color: '#ffe1ad', strength: 0.18 },
    dust: { color: '#ffd49a', count: 1600 },
  },
  // The descent: colder, deeper, denser fog, more dread. Cool light shafts.
  charcoal: {
    fogDensity: 0.034,
    fogColor: 0x05060a,
    exposure: 0.9,
    bloom: { intensity: 1.3, threshold: 0.55, radius: 0.8 },
    vignette: 1.06,
    candle: { warm: '#e8822c', range: 6.0, strength: 2.2 },
    shaft: { color: '#bcd0ff', strength: 0.27 },
    dust: { color: '#ccbfac', count: 2400 },
  },
  // Moreau ember: richer, warmer, denser, jewelled glow. Stronger bloom.
  ember: {
    fogDensity: 0.018,
    fogColor: 0x0a0604,
    exposure: 1.12,
    bloom: { intensity: 1.55, threshold: 0.42, radius: 0.85 },
    vignette: 0.84,
    candle: { warm: '#ffae4d', range: 8.6, strength: 3.3 },
    shaft: { color: '#ffd49a', strength: 0.21 },
    dust: { color: '#ffc89c', count: 2800 },
  },
}

function pick() {
  try {
    return new URLSearchParams(window.location.search).get('treatment')
  } catch {
    return null
  }
}

const id = pick()
// Charcoal is the default register (the descent); gold/ember via ?treatment=.
export const TREATMENT_ID = id && TREATMENTS[id] ? id : 'charcoal'
export const T = TREATMENTS[TREATMENT_ID]
