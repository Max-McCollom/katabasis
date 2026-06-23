import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useUI } from '../state/store.js'
import { makeMatcapSet } from '../render/matcaps.js'
import { makeEstateMatcap } from '../render/estateMaterial.js'
import { CANDLES } from '../world/layout.js'
import { chapters } from '../copy.js'
import { radialTexture } from '../world/geometry.js'

const tmpFrom = new THREE.Vector3()

// In-world inspectables. A lectern surfaces frozen copy diegetically; an orrery
// launches the minigame. Proximity shows a prompt; E (or click) interacts. The
// reading move draws the camera in cinematically (Player yields while paused).
const LIST = [
  {
    id: 'lectern',
    kind: 'read',
    pos: [3.6, 0, 22],
    prompt: 'Read the inscription',
    focus: { from: [3.6, 1.65, 25.2], to: [3.6, 1.15, 22] },
    payload: { id: chapters[0].id, numeral: chapters[0].numeral, title: chapters[0].title, paragraphs: chapters[0].paragraphs },
  },
  { id: 'orrery', kind: 'game', pos: [-3.8, 0, 2], prompt: 'Work the mechanism', gameId: 'astrolabe' },
]

function GlowMark({ on }) {
  const ref = useRef()
  const tex = useMemo(() => radialTexture({ inner: 'rgba(255,210,140,1)', outer: 'rgba(255,150,60,0)' }), [])
  useFrame((s) => {
    if (!ref.current) return
    const t = s.clock.elapsedTime
    const base = on ? 2.4 : 1.5
    ref.current.scale.setScalar(base * (0.9 + 0.1 * Math.sin(t * 5)))
    ref.current.material.opacity = (on ? 0.9 : 0.5) * (0.85 + 0.15 * Math.sin(t * 7))
  })
  return (
    <sprite ref={ref} position={[0, 1.4, 0]}>
      <spriteMaterial map={tex} color={'#ffcf8a'} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
    </sprite>
  )
}

function Lectern({ mat, near }) {
  return (
    <group position={LIST[0].pos}>
      <mesh position={[0, 0.55, 0]} material={mat.stone}>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
      </mesh>
      <mesh position={[0, 1.25, 0]} rotation={[-0.5, 0, 0]} material={mat.brass}>
        <boxGeometry args={[1.3, 0.12, 0.9]} />
      </mesh>
      <GlowMark on={near} />
    </group>
  )
}

function Orrery({ mat, near }) {
  const ref = useRef()
  useFrame((_, dt) => ref.current && (ref.current.rotation.y += dt * 0.25))
  return (
    <group position={LIST[1].pos}>
      <mesh position={[0, 0.5, 0]} material={mat.stone}>
        <cylinderGeometry args={[0.5, 0.7, 1.0, 16]} />
      </mesh>
      <group ref={ref} position={[0, 1.5, 0]}>
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
      <GlowMark on={near} />
    </group>
  )
}

export default function Inspectables() {
  const { camera } = useThree()
  const near = useUI((s) => s.near)
  const reading = useUI((s) => s.reading)

  const mat = useMemo(() => {
    const set = makeMatcapSet()
    return {
      stone: makeEstateMatcap(set.stone, CANDLES, { range: 7 }),
      brass: makeEstateMatcap(set.brass, CANDLES, { range: 9, strength: 3 }),
      gilt: makeEstateMatcap(set.gilt, CANDLES, { range: 8, strength: 3 }),
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'KeyE') return
      const st = useUI.getState()
      if (st.paused) return
      const id = st.near?.id
      const item = LIST.find((l) => l.id === id)
      if (!item) return
      if (item.kind === 'read') st.read(item.payload)
      else st.launch(item.gameId)
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
    // proximity (horizontal distance from the camera)
    let found = null
    let best = 4.5
    for (const l of LIST) {
      const dx = camera.position.x - l.pos[0]
      const dz = camera.position.z - l.pos[2]
      const d = Math.hypot(dx, dz)
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
      <Lectern mat={mat} near={near?.id === 'lectern'} />
      <Orrery mat={mat} near={near?.id === 'orrery'} />
    </group>
  )
}
