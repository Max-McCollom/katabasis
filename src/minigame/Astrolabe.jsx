import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useUI } from '../state/store.js'
import { useProgress } from '../state/progress.js'
import { playSolve } from '../audio/cues.js'
import './minigame.css'

// THE ASTROLABE LOCK. Concentric rings, each with one mark. Turning a ring also
// nudges the ring outside it (coupled), so it is a real ordering puzzle, not a
// row of independent dials. Bring every mark to the conjunction (top) to open
// the lock. Self-contained and complete; the registry lets others drop in.

const RINGS = 4
const STOPS = 8 // positions per ring
const GLYPHS = ['☉', '☽', '☿', '♀', '♂', '♃', '♄', '⚹'] // sun moon mercury venus mars jupiter saturn sextile
const RADII = [56, 92, 128, 164]

function scramble() {
  // start solved (all 0) then apply random coupled turns -> always solvable
  const v = new Array(RINGS).fill(0)
  let moves = 0
  while (moves < 14 || v.every((x) => x === 0)) {
    const i = Math.floor(Math.random() * RINGS)
    v[i] = (v[i] + 1) % STOPS
    v[(i + 1) % RINGS] = (v[(i + 1) % RINGS] + 1) % STOPS
    moves++
    if (moves > 60) break
  }
  return v
}

export default function Astrolabe() {
  const exitGame = useUI((s) => s.exitGame)
  const [vals, setVals] = useState(() => {
    try {
      // test seed: one coupled turn of ring 0 from solved (harness verifies win)
      if (new URLSearchParams(window.location.search).has('solve')) return [7, 7, 0, 0]
    } catch {}
    return scramble()
  })
  const [turns, setTurns] = useState(0)
  const solved = useMemo(() => vals.every((v) => v === 0), [vals])
  useEffect(() => {
    if (solved) {
      useProgress.getState().markSolved('astrolabe')
      playSolve()
    }
  }, [solved])

  const turn = useCallback(
    (i) => {
      if (solved) return
      setVals((prev) => {
        const next = prev.slice()
        next[i] = (next[i] + 1) % STOPS
        next[(i + 1) % RINGS] = (next[(i + 1) % RINGS] + 1) % STOPS
        return next
      })
      setTurns((t) => t + 1)
    },
    [solved],
  )

  const reset = () => {
    setVals(scramble())
    setTurns(0)
  }

  return (
    <div className="kb-game">
      <div className="kb-game__frame">
        <div className="kb-game__head">
          <span className="kb-game__kicker">The Astrolabe Lock</span>
          <button className="kb-game__x" onClick={exitGame} aria-label="Leave">
            &times;
          </button>
        </div>

        <p className="kb-game__instr">
          Turning a ring drives the one beyond it. Bring every mark to the conjunction.
        </p>

        <svg className={'kb-astro' + (solved ? ' is-solved' : '')} viewBox="0 0 400 400" role="img" aria-label="Astrolabe puzzle">
          {/* conjunction marker at top */}
          <polygon points="200,8 192,24 208,24" className="kb-astro__target" />
          <circle cx="200" cy="200" r="22" className="kb-astro__hub" />
          {RADII.map((r, i) => {
            const angle = (vals[i] / STOPS) * 360
            return (
              <g key={i} transform={`rotate(${angle} 200 200)`} className="kb-astro__ring" onClick={() => turn(i)}>
                <circle cx="200" cy="200" r={r} className="kb-astro__band" />
                {Array.from({ length: STOPS }).map((_, k) => {
                  const a = (k / STOPS) * Math.PI * 2 - Math.PI / 2
                  const x = 200 + Math.cos(a) * r
                  const y = 200 + Math.sin(a) * r
                  const isMark = k === 0
                  return (
                    <g key={k} className={isMark ? 'kb-astro__mark' : 'kb-astro__tick'}>
                      <circle cx={x} cy={y} r={isMark ? 7 : 2.4} />
                      {isMark && (
                        <text x={x} y={y + 0.5} className="kb-astro__glyph" transform={`rotate(${-angle} ${x} ${y})`}>
                          {GLYPHS[i % GLYPHS.length]}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>

        <div className="kb-game__foot">
          {solved ? (
            <>
              <span className="kb-game__win">The lock yields.</span>
              <button className="kb-game__btn" onClick={exitGame}>
                Return to the hall
              </button>
            </>
          ) : (
            <>
              <span className="kb-game__turns">Turns {turns}</span>
              <button className="kb-game__btn ghost" onClick={reset}>
                Reset the rings
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
