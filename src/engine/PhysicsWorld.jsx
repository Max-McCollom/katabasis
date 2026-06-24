import React from 'react'
import { Physics } from '@react-three/rapier'
import Player from './Player.jsx'
import Colliders from './Colliders.jsx'
import Inspectables from '../inspect/Inspectables.jsx'

// The live interaction layer, isolated so it (and the heavy Rapier WASM it
// pulls) can be code-split out of the initial bundle via React.lazy. Gravity is
// handled in the character controller, so the world gravity is zero.
export default function PhysicsWorld() {
  return (
    <Physics gravity={[0, 0, 0]}>
      <Player />
      <Colliders />
      <Inspectables />
    </Physics>
  )
}
