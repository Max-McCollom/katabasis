// Shared estate layout. Visuals (Hall) and primitive colliders (Colliders) both
// read these so the collision shells track the architecture.
export const BAYS = [28, 20, 12, 4, -4, -12, -20]
export const COL_X = 6.4
export const COL_H = 16
export const WALL_X = COL_X + 4.4
export const zNear = BAYS[0] + 6
export const zFar = BAYS[BAYS.length - 1] - 6
export const len = zNear - zFar
export const midZ = (zNear + zFar) / 2

export const CANDLES = BAYS.flatMap((z) => [
  [-COL_X + 1.5, 5.5, z],
  [COL_X - 1.5, 5.5, z],
])

export const SPAWN = [0, 1.0, zNear - 2] // capsule centre; eye is offset up in Player

// --- Zone II: The Descent. A continuous grand stair from the hall floor (y=0,
// z~-30) down to a deep landing, then a balcony over an impossible vertical
// shaft falling to true black. ---
export const DESC_TOP_Z = zFar - 4 // grand stair begins at the far arch
export const DESC_LANDING_Y = -12
export const DESC_LANDING_Z = -56
export const DESC_BACK_Z = -70
export const DESC_WALL_X = 11
export const DESC_STEPS = 16
export const DESC_RISE = 0.75
export const DESC_RUN = 1.3
export const DESC_STAIR_BOTTOM_Z = DESC_TOP_Z - DESC_STEPS * DESC_RUN
export const DESC_BALCONY_Z = DESC_STAIR_BOTTOM_Z - 12

// dim candles for the descent (deeper, sparser than the hall)
export const DESCENT_CANDLES = [
  [-7.5, DESC_LANDING_Y + 4.5, DESC_LANDING_Z + 4],
  [7.5, DESC_LANDING_Y + 4.5, DESC_LANDING_Z + 4],
  [-3.5, -3.5, -40],
  [3.5, -7.5, -47],
  [0, DESC_LANDING_Y + 3, DESC_LANDING_Z + 1],
]

// All estate lights. Every fake-bounce material reads this so candlelight is
// continuous across the descent (one shader loop, N kept modest).
export const ESTATE_LIGHTS = [...CANDLES, ...DESCENT_CANDLES]
