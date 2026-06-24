import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useUI } from '../state/store.js'
import { useProgress } from '../state/progress.js'
import './minigame.css'
import './braziers.css'

// THE NINE BRAZIERS. A lights-out puzzle, distinct in kind from the Astrolabe's
// coupled rotation. Touching a brazier flips its own flame and the flames of
// the braziers it shares an edge with (a uniform toggle, self included). The
// fires interfere, so it is a real parity puzzle, not nine independent
// switches. Light all nine to win. Scrambled from the all-lit state, so a
// solution always exists.

const SIZE = 3 // 3x3 constellation
const N = SIZE * SIZE
const GLYPHS = ['☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆'] // luminary sigils, one per node (BMP, render-clean)

// Orthogonal neighbours within the grid, precomputed so adjacency is explicit
// and never inferred at click time.
const NEIGHBOURS = Array.from({ length: N }, (_, i) => {
  const r = Math.floor(i / SIZE)
  const c = i % SIZE
  const out = [i]
  if (r > 0) out.push(i - SIZE)
  if (r < SIZE - 1) out.push(i + SIZE)
  if (c > 0) out.push(i - 1)
  if (c < SIZE - 1) out.push(i + 1)
  return out
})

// One shared toggle used by both scramble and the click handler, so a scrambled
// board is always reachable back to solved by gameplay (invertibility is
// structural, not a coincidence). `lit` is an array of booleans.
function toggle(lit, i) {
  const next = lit.slice()
  for (const j of NEIGHBOURS[i]) next[j] = !next[j]
  return next
}

function scramble() {
  // start solved (all lit) then apply random toggles -> always solvable
  let lit = new Array(N).fill(true)
  let moves = 0
  while (moves < 9 || lit.every((x) => x)) {
    const i = Math.floor(Math.random() * N)
    lit = toggle(lit, i)
    moves++
    if (moves > 40) break
  }
  return lit
}

// Pixel positions for each node on the 300x300 board.
const GAP = 100
const ORIGIN = 50
function nodePos(i) {
  const r = Math.floor(i / SIZE)
  const c = i % SIZE
  return { x: ORIGIN + c * GAP, y: ORIGIN + r * GAP }
}

export default function Braziers() {
  const exitGame = useUI((s) => s.exitGame)
  const [lit, setLit] = useState(() => {
    try {
      // test seed: one toggle of node 0 away from solved. The harness clicks the
      // FIRST rendered brazier (index 0), which re-applies the toggle and wins.
      if (new URLSearchParams(window.location.search).has('solve')) {
        return toggle(new Array(N).fill(true), 0)
      }
    } catch {}
    return scramble()
  })
  const [turns, setTurns] = useState(0)
  const solved = useMemo(() => lit.every((v) => v), [lit])
  useEffect(() => {
    if (solved) useProgress.getState().markSolved('braziers')
  }, [solved])

  const kindle = useCallback(
    (i) => {
      if (solved) return
      setLit((prev) => toggle(prev, i))
      setTurns((t) => t + 1)
    },
    [solved],
  )

  const reset = () => {
    setLit(scramble())
    setTurns(0)
  }

  return (
    <div className="kb-game">
      <div className="kb-game__frame">
        <div className="kb-game__head">
          <span className="kb-game__kicker">The Nine Braziers</span>
          <button className="kb-game__x" onClick={exitGame} aria-label="Leave">
            &times;
          </button>
        </div>

        <p className="kb-game__instr">
          Each flame you touch turns itself and the braziers beside it. Set every brazier alight.
        </p>

        <svg
          className={'kb-braz' + (solved ? ' is-solved' : '')}
          viewBox="0 0 300 300"
          role="img"
          aria-label="Braziers puzzle"
        >
          {/* links between adjacent braziers, drawn first so nodes sit above */}
          {NEIGHBOURS.map((adj, i) =>
            adj
              .filter((j) => j > i)
              .map((j) => {
                const a = nodePos(i)
                const b = nodePos(j)
                return <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="kb-braz__link" />
              }),
          )}

          {lit.map((isLit, i) => {
            const { x, y } = nodePos(i)
            return (
              <g
                key={i}
                className={'kb-braz__node' + (isLit ? ' is-lit' : '')}
                transform={`translate(${x} ${y})`}
                onClick={() => kindle(i)}
                role="button"
                aria-label={isLit ? 'lit brazier' : 'dark brazier'}
              >
                <circle r="30" className="kb-braz__halo" />
                <circle r="20" className="kb-braz__bowl" />
                <text className="kb-braz__sigil" y="1.5">
                  {GLYPHS[i]}
                </text>
              </g>
            )
          })}
        </svg>

        <div className="kb-game__foot">
          {solved ? (
            <>
              <span className="kb-game__win">The fires stand as one.</span>
              <button className="kb-game__btn" onClick={exitGame}>
                Return to the hall
              </button>
            </>
          ) : (
            <>
              <span className="kb-game__turns">Touches {turns}</span>
              <button className="kb-game__btn ghost" onClick={reset}>
                Scatter the embers
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
