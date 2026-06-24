import React, { useRef, useState } from 'react'
import { touch } from '../engine/touchInput.js'
import './touch.css'

const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const R = 50 // joystick radius (px)

// Left virtual joystick for movement (coarse pointers only). Drag-look is
// handled by the Player on the rest of the screen; touches that begin on this
// element never reach the canvas, so the two never fight.
export default function TouchControls() {
  const base = useRef()
  const center = useRef({ x: 0, y: 0 })
  const id = useRef(null)
  const [thumb, setThumb] = useState({ x: 0, y: 0 })

  const start = (e) => {
    id.current = e.pointerId
    const r = base.current.getBoundingClientRect()
    center.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    base.current.setPointerCapture?.(e.pointerId)
    move(e)
  }
  const move = (e) => {
    if (id.current !== e.pointerId) return
    let dx = e.clientX - center.current.x
    let dy = e.clientY - center.current.y
    const d = Math.hypot(dx, dy)
    if (d > R) {
      dx *= R / d
      dy *= R / d
    }
    setThumb({ x: dx, y: dy })
    touch.mx = dx / R
    touch.my = -dy / R
  }
  const end = (e) => {
    if (id.current !== e.pointerId) return
    id.current = null
    setThumb({ x: 0, y: 0 })
    touch.mx = 0
    touch.my = 0
  }

  if (!COARSE) return null
  return (
    <div className="kb-joy" ref={base} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      <div className="kb-joy__thumb" style={{ transform: `translate(${thumb.x}px, ${thumb.y}px)` }} />
    </div>
  )
}
