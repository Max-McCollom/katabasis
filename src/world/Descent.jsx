import React, { useMemo } from 'react'
import * as THREE from 'three'
import { getEstateMaterials } from '../render/estateMaterials.js'
import { Candle } from './Hall.jsx'
import { flutedColumnGeometry, archRingGeometry } from './geometry.js'
import {
  DESC_TOP_Z,
  DESC_LANDING_Y,
  DESC_BACK_Z,
  DESC_WALL_X,
  DESC_STEPS,
  DESC_RISE as RISE,
  DESC_RUN as RUN,
  DESC_STAIR_BOTTOM_Z as STAIR_BOTTOM_Z,
  DESC_BALCONY_Z as BALCONY_Z,
  DESCENT_CANDLES,
} from './layout.js'

// Zone II: a continuous descent into a vertiginous, impossible shaft falling to
// true black. Critiqued against Piranesi's Carceri: vertical void, bridges
// crossing at wrong angles, stairs that lead nowhere.
export default function Descent() {
  const mat = getEstateMaterials()
  const pendant = useMemo(() => flutedColumnGeometry({ height: 15, radius: 0.55 }), [])
  const escher = useMemo(() => Array.from({ length: 9 }, (_, i) => i), [])
  const farArch = useMemo(() => archRingGeometry({ ri: 4.6, ro: 6.2, depth: 1.8 }), [])

  return (
    <group>
      {/* grand descent stair, hall floor -> landing */}
      {Array.from({ length: DESC_STEPS }).map((_, i) => (
        <mesh key={'st' + i} position={[0, -(i + 0.5) * RISE, DESC_TOP_Z - (i + 0.5) * RUN]} material={mat.stone}>
          <boxGeometry args={[12, RISE, RUN + 0.03]} />
        </mesh>
      ))}
      {/* stair cheeks */}
      {[-6.4, 6.4].map((x, i) => (
        <mesh key={'ch' + i} position={[x, -6.2, (DESC_TOP_Z + STAIR_BOTTOM_Z) / 2]} rotation={[Math.atan2(RISE, RUN), 0, 0]} material={mat.stone}>
          <boxGeometry args={[1.4, 2.4, (DESC_STEPS * RUN) * 1.18]} />
        </mesh>
      ))}

      {/* landing floor (solid) up to the balcony edge */}
      <mesh position={[0, DESC_LANDING_Y - 0.4, (STAIR_BOTTOM_Z + BALCONY_Z) / 2]} material={mat.floor}>
        <boxGeometry args={[2 * DESC_WALL_X, 0.8, STAIR_BOTTOM_Z - BALCONY_Z + 0.5]} />
      </mesh>
      {/* low balustrade over the shaft */}
      <mesh position={[0, DESC_LANDING_Y + 0.6, BALCONY_Z]} material={mat.brass}>
        <boxGeometry args={[2 * DESC_WALL_X, 1.2, 0.6]} />
      </mesh>

      {/* shaft walls: plunging from high above to deep below */}
      {[-DESC_WALL_X, DESC_WALL_X].map((x, i) => (
        <mesh key={'w' + i} position={[x, -16, (DESC_TOP_Z + DESC_BACK_Z) / 2]} material={mat.stone}>
          <boxGeometry args={[1.6, 64, DESC_TOP_Z - DESC_BACK_Z + 6]} />
        </mesh>
      ))}
      {/* back wall far down the shaft, with an arch into deeper black */}
      <mesh position={[0, -22, DESC_BACK_Z]} material={mat.stone}>
        <boxGeometry args={[2 * DESC_WALL_X, 56, 1.4]} />
      </mesh>
      <mesh position={[0, -30, DESC_BACK_Z + 0.9]} geometry={farArch} material={mat.brass} />

      {/* UNCANNY: pendant columns hanging into the void, reaching no floor */}
      {[
        [-6, -12, BALCONY_Z - 6],
        [6, -16, BALCONY_Z - 12],
        [0, -20, BALCONY_Z - 20],
        [-7, -26, BALCONY_Z - 24],
      ].map((p, i) => (
        <mesh key={'pd' + i} geometry={pendant} material={mat.stone} position={p} rotation={[Math.PI, 0, 0]} />
      ))}

      {/* UNCANNY: bridges crossing the shaft at wrong angles, deep down */}
      <mesh position={[0, -19, BALCONY_Z - 10]} rotation={[0, 0.5, 0.04]} material={mat.stone}>
        <boxGeometry args={[2 * DESC_WALL_X + 6, 0.7, 2.4]} />
      </mesh>
      <mesh position={[0, -28, BALCONY_Z - 18]} rotation={[0, -0.7, -0.05]} material={mat.stone}>
        <boxGeometry args={[2 * DESC_WALL_X + 8, 0.7, 2.2]} />
      </mesh>
      <mesh position={[1, -37, BALCONY_Z - 26]} rotation={[0.04, 0.3, 0]} material={mat.stone}>
        <boxGeometry args={[2 * DESC_WALL_X + 4, 0.7, 2.0]} />
      </mesh>

      {/* UNCANNY: an Escher stair climbing a side wall to nowhere */}
      {escher.map((i) => (
        <mesh key={'es' + i} position={[-DESC_WALL_X + 1.5, -18 + i * 0.9, BALCONY_Z - 4 - i * 1.1]} rotation={[0, 0.25, 0]} material={mat.stone}>
          <boxGeometry args={[3.2, 0.45, 1.2]} />
        </mesh>
      ))}

      {/* dim candles of the descent (colder, sparser than the hall) */}
      {DESCENT_CANDLES.map((p, i) => (
        <Candle key={'dc' + i} position={p} intensity={0.4} />
      ))}
    </group>
  )
}
