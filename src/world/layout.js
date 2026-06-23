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
