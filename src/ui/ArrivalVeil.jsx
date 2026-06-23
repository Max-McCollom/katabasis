import React, { useState, useEffect } from 'react'
import './arrival.css'

// The first 5 seconds: not a blank screen. A warm darkness with the wordmark
// guttering like a candle, which lifts to reveal the establishing view as the
// camera settles into place.
export default function ArrivalVeil() {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setGone(true), 2900)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className={'kb-veil' + (gone ? ' is-gone' : '')} aria-hidden={gone}>
      <div className="kb-veil__mark">Katabasis</div>
      <div className="kb-veil__hint">drag to look &middot; W A S D to move &middot; E to inspect</div>
    </div>
  )
}
