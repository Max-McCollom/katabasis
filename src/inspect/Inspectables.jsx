import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useUI } from '../state/store.js'
import { useProgress } from '../state/progress.js'
import { getEstateMaterials } from '../render/estateMaterials.js'
import { chapters } from '../copy.js'
import { radialTexture } from '../world/geometry.js'
import { DESC_LANDING_Y } from '../world/layout.js'

const tmpFrom = new THREE.Vector3()

// Two copy inspectables (one per zone) + two minigame inspectables (one per
// zone). Proximity shows a prompt; E (or click) interacts. The reading move
// draws the camera in cinematically; the Player yields while paused.
const DZ = -60 // descent landing z (near the balcony, where the player arrives)
const ch = (i) => ({ id: chapters[i].id, numeral: chapters[i].numeral, title: chapters[i].title, paragraphs: chapters[i].paragraphs })

const LIST = [
  // hall
  {
    id: 'lectern1', model: 'lectern', kind: 'read', pos: [3.6, 0, 22], prompt: 'Read the inscription',
    focus: { from: [3.6, 1.65, 25.2], to: [3.6, 1.15, 22] }, payload: ch(0),
  },
  { id: 'orrery', model: 'orrery', kind: 'game', pos: [-3.8, 0, 2], prompt: 'Work the mechanism', gameId: 'astrolabe' },
  // descent landing
  {
    id: 'lectern2', model: 'lectern', kind: 'read', pos: [-6, DESC_LANDING_Y, DZ], prompt: 'Read the inscription',
    focus: { from: [-6, DESC_LANDING_Y + 1.6, DZ + 3.2], to: [-6, DESC_LANDING_Y + 1.0, DZ] }, payload: ch(1),
  },
  { id: 'brazier', model: 'brazier', kind: 'game', pos: [6, DESC_LANDING_Y, DZ], prompt: 'Tend the braziers', gameId: 'braziers' },
]

function GlowMark({ on, done, y = 1.4 }) {
  const ref = useRef()
  const tex = useMemo(() => radialTexture({ inner: 'rgba(255,210,140,1)', outer: 'rgba(255,150,60,0)' }), [])
  useFrame((s) => {
    if (!ref.current) return
    const t = s.clock.elapsedTime
    const base = on ? 2.6 : done ? 2.2 : 1.6
    const fl = done ? 0.04 : 0.15 // steadier once completed
    ref.current.scale.setScalar(base * (0.92 + fl * Math.sin(t * 5)))
    ref.current.material.opacity = (on ? 0.95 : done ? 0.8 : 0.55) * (0.9 + fl * Math.sin(t * 7))
  })
  return (
    <sprite ref={ref} position={[0, y, 0]}>
      <spriteMaterial map={tex} color={done ? '#ffe6b4' : '#ffcf8a'} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
    </sprite>
  )
}

function Model({ item, near, mat, done }) {
  const spin = useRef()
  useFrame((_, dt) => spin.current && (spin.current.rotation.y += dt * 0.25))
  if (item.model === 'lectern') {
    return (
      <group position={item.pos}>
        <mesh position={[0, 0.55, 0]} material={mat.stone}>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
        </mesh>
        <mesh position={[0, 1.25, 0]} rotation={[-0.5, 0, 0]} material={mat.brass}>
          <boxGeometry args={[1.3, 0.12, 0.9]} />
        </mesh>
        <GlowMark on={near} done={done} />
      </group>
    )
  }
  if (item.model === 'orrery') {
    return (
      <group position={item.pos}>
        <mesh position={[0, 0.5, 0]} material={mat.stone}>
          <cylinderGeometry args={[0.5, 0.7, 1.0, 16]} />
        </mesh>
        <group ref={spin} position={[0, 1.5, 0]}>
          <mesh material={mat.brass}>
            <torusGeometry args={[0.7, 0.035, 12, 48]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={mat.gilt}>
            <torusGeometry args={[0.55, 0.03, 12, 48]} />
          </mesh>
          <mesh rotation={[0.4, 0.7, 0]} material={mat.brass}>
            <torusGeometry args={[0.42, 0.025, 12, 48]} />
          </mesh>
          <mesh material={mat.gilt}>
            <icosahedronGeometry args={[0.12, 0]} />
          </mesh>
        </group>
        <GlowMark on={near} done={done} />
      </group>
    )
  }
  // brazier mechanism (launches the braziers puzzle)
  return (
    <group position={item.pos}>
      <mesh position={[0, 0.7, 0]} material={mat.stone}>
        <cylinderGeometry args={[0.18, 0.4, 1.4, 12]} />
      </mesh>
      <mesh position={[0, 1.5, 0]} material={mat.brass}>
        <cylinderGeometry args={[0.7, 0.4, 0.5, 16, 1, true]} />
      </mesh>
      <GlowMark on={near} done={done} y={1.7} />
    </group>
  )
}

export default function Inspectables() {
  const { camera } = useThree()
  const near = useUI((s) => s.near)
  const read = useProgress((s) => s.read)
  const solved = useProgress((s) => s.solved)
  const mat = getEstateMaterials()

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'KeyE') return
      const st = useUI.getState()
      if (st.paused) return
      const item = LIST.find((l) => l.id === st.near?.id)
      if (!item) return
      if (item.kind === 'read') {
        st.read(item.payload)
        useProgress.getState().markRead(item.payload.id)
      } else st.launch(item.gameId)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useFrame((_, dt) => {
    const st = useUI.getState()
    if (st.reading) {
      const item = LIST.find((l) => l.id === st.reading.id)
      if (item?.focus) {
        tmpFrom.set(...item.focus.from)
        camera.position.lerp(tmpFrom, 1 - Math.exp(-5 * Math.min(dt, 1 / 30)))
        camera.lookAt(item.focus.to[0], item.focus.to[1], item.focus.to[2])
      }
      return
    }
    if (st.paused) return
    let found = null
    let best = 4.8
    for (const l of LIST) {
      const d = Math.hypot(camera.position.x - l.pos[0], camera.position.y - l.pos[1], camera.position.z - l.pos[2])
      if (d < best) {
        best = d
        found = l
      }
    }
    const cur = st.near?.id || null
    if ((found?.id || null) !== cur) st.setNear(found ? { id: found.id, prompt: found.prompt } : null)
  })

  return (
    <group>
      {LIST.map((item) => {
        const done = item.kind === 'read' ? !!read[item.payload.id] : !!solved[item.gameId]
        return <Model key={item.id} item={item} near={near?.id === item.id} mat={mat} done={done} />
      })}
    </group>
  )
}
