import React from 'react'
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier'
import { BAYS, COL_X, COL_H, WALL_X, zFar, len, midZ } from '../world/layout.js'

// Primitive colliders shadowing the visuals (the user's spec). One fixed body
// holding cuboids/cylinders that track the architecture, so the capsule never
// clips. Cheap and exact-enough.
export default function Colliders() {
  return (
    <RigidBody type="fixed" colliders={false}>
      {/* floor */}
      <CuboidCollider args={[WALL_X, 0.5, (len + 30) / 2]} position={[0, -0.5, midZ]} />
      {/* enclosing walls */}
      <CuboidCollider args={[0.8, 20, (len + 16) / 2]} position={[-WALL_X, 12, midZ]} />
      <CuboidCollider args={[0.8, 20, (len + 16) / 2]} position={[WALL_X, 12, midZ]} />
      {/* columns */}
      {BAYS.map((z, i) => (
        <React.Fragment key={i}>
          <CylinderCollider args={[COL_H / 2, 0.95]} position={[-COL_X, COL_H / 2, z]} />
          <CylinderCollider args={[COL_H / 2, 0.95]} position={[COL_X, COL_H / 2, z]} />
        </React.Fragment>
      ))}
      {/* descent stair */}
      {Array.from({ length: 12 }).map((_, i) => (
        <CuboidCollider key={'s' + i} args={[(10 - i * 0.2) / 2, 0.4, 0.9]} position={[0, -0.5 - i * 0.75, zFar - 6 - i * 1.7]} />
      ))}
    </RigidBody>
  )
}
