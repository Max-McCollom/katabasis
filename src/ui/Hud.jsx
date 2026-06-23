import React, { useEffect } from 'react'
import { useUI } from '../state/store.js'
import './overlay.css'

// DOM overlays: the proximity prompt and the frozen-copy reading panel. Kept out
// of the Canvas so text is crisp and selectable. Copy is rendered verbatim from
// the store payload (sourced from src/copy.js); never rewritten here.
export default function Hud() {
  const near = useUI((s) => s.near)
  const reading = useUI((s) => s.reading)
  const closeRead = useUI((s) => s.closeRead)

  useEffect(() => {
    if (!reading) return
    const onKey = (e) => e.key === 'Escape' && closeRead()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reading, closeRead])

  return (
    <div className="kb-ui">
      {near && !reading && (
        <div className="kb-prompt">
          {near.prompt || 'Inspect'} <span className="kb-key">E</span>
        </div>
      )}

      {reading && (
        <div className="kb-read" onClick={closeRead}>
          <div className="kb-read__panel" onClick={(e) => e.stopPropagation()}>
            {reading.numeral && <div className="kb-read__num">{reading.numeral}</div>}
            <h2 className="kb-read__title">{reading.title}</h2>
            <div className="kb-read__body">
              {reading.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <button className="kb-read__close" onClick={closeRead}>
              Withdraw
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
