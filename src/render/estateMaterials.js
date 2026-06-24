import { makeMatcapSet } from './matcaps.js'
import { makeEstateMatcap } from './estateMaterial.js'
import { ESTATE_LIGHTS } from '../world/layout.js'
import { T } from './treatments.js'

// One shared estate material set (singleton) so both zones and the inspectables
// read the same matcaps + the same continuous candle-light array.
let _set = null

export function getEstateMaterials() {
  if (_set) return _set
  const set = makeMatcapSet()
  const c = T.candle
  const L = ESTATE_LIGHTS
  _set = {
    stone: makeEstateMatcap(set.stone, L, { warm: c.warm, range: c.range, strength: c.strength * 0.92 }),
    oak: makeEstateMatcap(set.oak, L, { warm: c.warm, range: c.range, strength: c.strength * 1.08 }),
    brass: makeEstateMatcap(set.brass, L, { warm: c.warm, range: c.range + 1.5, strength: c.strength * 1.15 }),
    gilt: makeEstateMatcap(set.gilt, L, { warm: c.warm, range: c.range + 0.5, strength: c.strength * 1.15 }),
    floor: makeEstateMatcap(set.stone, L, { warm: c.warm, range: c.range, strength: c.strength * 0.78, floor: true }),
  }
  return _set
}
