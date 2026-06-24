import React from 'react'
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier'
import {
  BAYS,
  COL_X,
  COL_H,
  WALL_X,
  zFar,
  len,
  midZ,
  DESC_TOP_Z,
  DESC_LANDING_Y,
  DESC_BACK_Z,
  DESC_WALL_X,
  DESC_STEPS,
  DESC_RISE,
  DESC_RUN,
  DESC_STAIR_BOTTOM_Z,
  DESC_BALCONY_Z,
} from '../world/layout.js'

// Primitive colliders shadowing the visuals across both zones. The capsule
// never clips, never falls into the shaft (the balustrade stops it).
export default function Colliders() {
  return (
    <RigidBody type="fixed" colliders={false}>
      {/* --- hall --- */}
      <CuboidCollider args={[WALL_X, 0.5, 34.5]} position={[0, -0.5, 4.5]} />
      <CuboidCollider args={[0.8, 20, (len + 16) / 2]} position={[-WALL_X, 12, midZ]} />
      <CuboidCollider args={[0.8, 20, (len + 16) / 2]} position={[WALL_X, 12, midZ]} />
      {BAYS.map((z, i) => (
        <React.Fragment key={i}>
          <CylinderCollider args={[COL_H / 2, 0.95]} position={[-COL_X, COL_H / 2, z]} />
          <CylinderCollider args={[COL_H / 2, 0.95]} position={[COL_X, COL_H / 2, z]} />
        </React.Fragment>
      ))}

      {/* --- descent: grand stair --- */}
      {Array.from({ length: DESC_STEPS }).map((_, i) => (
        <CuboidCollider key={'ds' + i} args={[6, DESC_RISE / 2, (DESC_RUN + 0.03) / 2]} position={[0, -(i + 0.5) * DESC_RISE, DESC_TOP_Z - (i + 0.5) * DESC_RUN]} />
      ))}
      {/* landing floor */}
      <CuboidCollider args={[DESC_WALL_X, 0.4, (DESC_STAIR_BOTTOM_Z - DESC_BALCONY_Z + 0.5) / 2]} position={[0, DESC_LANDING_Y - 0.4, (DESC_STAIR_BOTTOM_Z + DESC_BALCONY_Z) / 2]} />
      {/* balustrade stops the player at the void's edge */}
      <CuboidCollider args={[DESC_WALL_X, 0.9, 0.4]} position={[0, DESC_LANDING_Y + 0.6, DESC_BALCONY_Z]} />
      {/* descent shaft walls */}
      <CuboidCollider args={[0.8, 32, (DESC_TOP_Z - DESC_BACK_Z + 6) / 2]} position={[-DESC_WALL_X, -16, (DESC_TOP_Z + DESC_BACK_Z) / 2]} />
      <CuboidCollider args={[0.8, 32, (DESC_TOP_Z - DESC_BACK_Z + 6) / 2]} position={[DESC_WALL_X, -16, (DESC_TOP_Z + DESC_BACK_Z) / 2]} />
    </RigidBody>
  )
}
