import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { T } from '../render/treatments.js'
import { LOW } from '../util/env.js'
import { useQuality } from '../state/quality.js'

// Drifting dust: instanced points with all motion in the vertex shader (near-
// zero cost ambient life). Denser, warmer where light falls.
function Dust({ count = 1500, spread = [22, 20, 64], z0 = 4, y0 = 0, color = T.dust.color }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() * 2 - 1) * spread[0] * 0.5
      pos[i * 3 + 1] = y0 + Math.random() * spread[1]
      pos[i * 3 + 2] = (Math.random() * 2 - 1) * spread[2] * 0.5 + z0
      seed[i] = Math.random() * 100
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [count, spread, z0, y0])

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uSize: { value: 26 }, uColor: { value: new THREE.Color(color) } },
        vertexShader: `
          attribute float aSeed; uniform float uTime; uniform float uSize;
          varying float vTw;
          void main(){
            vec3 p = position;
            p.y += sin(uTime*0.18 + aSeed)*0.7;
            p.x += sin(uTime*0.12 + aSeed*1.7)*0.6;
            p.z += cos(uTime*0.10 + aSeed*0.9)*0.6;
            vec4 mv = modelViewMatrix*vec4(p,1.0);
            gl_Position = projectionMatrix*mv;
            gl_PointSize = uSize*(1.0/ max(0.1,-mv.z));
            vTw = 0.35 + 0.65*pow(0.5+0.5*sin(uTime*1.6+aSeed*6.2),2.0);
          }`,
        fragmentShader: `
          uniform vec3 uColor; varying float vTw;
          void main(){
            float r = length(gl_PointCoord-0.5);
            float a = smoothstep(0.5,0.0,r)*vTw*0.5;
            gl_FragColor = vec4(uColor, a);
          }`,
      }),
    [],
  )
  useFrame((s) => (mat.uniforms.uTime.value = s.clock.elapsedTime))
  return <points geometry={geo} material={mat} frustumCulled={false} />
}

// Film-soft god-ray: a few crossed quads with a horizontal gaussian (edges
// dissolve, no cylinder silhouette), a vertical taper to a cone, and animated
// noise for volumetric shimmer. Doré single-source shaft, near-zero cost.
function Shaft({ position, height = 22, bottom = 4.6, color = '#ffe1ad', strength = 0.16 }) {
  const grp = useRef()
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: strength }, uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          uniform vec3 uColor; uniform float uStrength; uniform float uTime; varying vec2 vUv;
          float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
          float nz(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
            return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
          void main(){
            float taper = 2.6 + vUv.y * 2.4;                       // narrower toward the top (the source)
            float gx = exp(-pow((vUv.x - 0.5) * taper, 2.0));      // soft horizontal falloff, no hard edge
            float vy = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.42, vUv.y);
            float vol = 0.68 + 0.32 * nz(vec2(vUv.x * 3.0, vUv.y * 5.0 - uTime * 0.22));
            gl_FragColor = vec4(uColor, gx * vy * vol * uStrength);
          }`,
      }),
    [color, strength],
  )
  useFrame((s) => {
    mat.uniforms.uTime.value = s.clock.elapsedTime
    if (grp.current) {
      // cylindrical billboard: yaw to face the camera so it never shows a seam
      grp.current.rotation.y = Math.atan2(s.camera.position.x - position[0], s.camera.position.z - position[2])
    }
  })
  return (
    <group ref={grp} position={position} renderOrder={2}>
      <mesh material={mat}>
        <planeGeometry args={[bottom * 1.9, height]} />
      </mesh>
    </group>
  )
}

export default function Atmosphere() {
  const s = T.shaft
  const dustMul = useQuality((q) => q.dustMul)
  const m = (LOW ? 0.35 : 1) * dustMul
  return (
    <group>
      {/* hall */}
      <Dust count={Math.round(T.dust.count * m)} />
      <Shaft position={[-1.5, 11, 20]} color={s.color} strength={s.strength} />
      <Shaft position={[2.0, 11, 2]} color={s.color} strength={s.strength * 1.15} />
      <Shaft position={[-1.0, 11, -14]} color={s.color} strength={s.strength * 0.75} />
      {/* descent: deeper, colder dust + a cold shaft falling through the shaft
          AHEAD, lighting the crossing bridges the arriving visitor faces */}
      <Dust count={Math.round(T.dust.count * 0.8 * m)} spread={[20, 54, 34]} z0={-74} y0={-50} color={'#9fb0c8'} />
      <Shaft position={[0, -24, -74]} height={56} bottom={6.6} color={'#a8c0e8'} strength={s.strength * 1.35} />
    </group>
  )
}
