// Interaction cues. NOTE: like ambient.js, these are synthesized with the Web
// Audio API rather than played from Howler-loaded assets, because no audio files
// could be authored or verified this run. Each cue is a short, in-theme gesture
// (struck-brass / glass-harmonica color, warmed by a lowpass, with a soft decay
// tail standing in for reverb) layered under the ambient drone. Howler with
// authored/recorded cue assets (and a proper convolution reverb) is the intended
// upgrade; see docs/DECISIONS.md.
//
// On the AudioContext: ambient.js keeps its context module-private and does not
// export it, and this file may not edit ambient.js, so the two cannot literally
// share one object. We instead lazily create our own context on first cue (the
// "create-on-demand" branch the brief allows). A second AudioContext coexists
// fine, sits well under the browser limit, and is autoplay-guarded the same way:
// it is only made on a real cue call (which only happens after a user gesture),
// and every cue resumes it if the browser left it suspended.

let ctx = null
let master = null

// Lazily build (or fetch) the shared cue context. Guarded for autoplay: the
// context is not created at import time, only when a cue actually fires, and a
// suspended context is resumed before use.
function getCtx() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      ctx = new AC()
      master = ctx.createGain()
      // Modest master so cues sit under the ambient bed (ambient drone ~0.13,
      // its master ramps to 0.5). A warming lowpass takes the edge off the
      // synthesized partials so nothing reads as a video-game blip.
      master.gain.value = 0.5
      const warm = ctx.createBiquadFilter()
      warm.type = 'lowpass'
      warm.frequency.value = 2600
      warm.Q.value = 0.5
      master.connect(warm)
      warm.connect(ctx.destination)
    }
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume()
    return ctx
  } catch (e) {
    return null
  }
}

// One struck/bowed voice: oscillator -> per-voice lowpass -> gain envelope.
// Exponential ramps never touch true zero (they throw / no-op at 0), so the
// envelope rises from and decays to a tiny floor; the oscillator is stopped just
// past the tail so voices never accumulate across calls.
function voice(c, opts) {
  const {
    type = 'triangle',
    freq,
    t0,
    attack = 0.012,
    hold = 0,
    decay,
    peak,
    cutoff = 3200,
  } = opts
  const FLOOR = 0.0001

  const osc = c.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)

  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = cutoff
  lp.Q.value = 0.4

  const g = c.createGain()
  g.gain.setValueAtTime(FLOOR, t0)
  g.gain.exponentialRampToValueAtTime(Math.max(peak, FLOOR), t0 + attack)
  const sustainEnd = t0 + attack + hold
  if (hold > 0) g.gain.setValueAtTime(Math.max(peak, FLOOR), sustainEnd)
  g.gain.exponentialRampToValueAtTime(FLOOR, sustainEnd + decay)

  osc.connect(lp)
  lp.connect(g)
  g.connect(master)

  osc.start(t0)
  osc.stop(sustainEnd + decay + 0.05)
}

// A soft rising sting when a reader opens an inscription. ~0.4s: two warm notes,
// the upper entering just after the lower, shimmering up a perfect fifth.
export function playInspect() {
  try {
    const c = getCtx()
    if (!c) return
    const t = c.currentTime + 0.001
    // Low, then a fifth above, lightly detuned for a glassy shimmer.
    voice(c, { type: 'triangle', freq: 392.0, t0: t, attack: 0.02, decay: 0.34, peak: 0.16, cutoff: 2600 })
    voice(c, { type: 'sine', freq: 587.33, t0: t + 0.06, attack: 0.02, decay: 0.3, peak: 0.13, cutoff: 3200 })
    voice(c, { type: 'sine', freq: 589.0, t0: t + 0.06, attack: 0.02, decay: 0.3, peak: 0.06, cutoff: 3200 })
  } catch (e) {
    // never throw out of an audio cue
  }
}

// A resolving consonant arpeggio-into-chord when a minigame is won. ~1.2s: a
// major triad (with octave) entering as a quick upward arpeggio, swelling and
// fading. The satisfying resolution is the whole point.
export function playSolve() {
  try {
    const c = getCtx()
    if (!c) return
    const t = c.currentTime + 0.001
    // F major: F4 A4 C5 F5, struck in sequence, each ringing into a held chord.
    const notes = [349.23, 440.0, 523.25, 698.46]
    const peaks = [0.13, 0.12, 0.12, 0.1]
    for (let i = 0; i < notes.length; i++) {
      voice(c, {
        type: 'triangle',
        freq: notes[i],
        t0: t + i * 0.085,
        attack: 0.018,
        hold: 0.12,
        decay: 0.9 - i * 0.06,
        peak: peaks[i],
        cutoff: 3000,
      })
    }
    // A low sine root underneath gives the resolution body without mud.
    voice(c, { type: 'sine', freq: 174.61, t0: t, attack: 0.04, hold: 0.2, decay: 0.85, peak: 0.11, cutoff: 1400 })
  } catch (e) {
    // never throw out of an audio cue
  }
}

// A soft low cue when leaving a reading or minigame. ~0.3s: a single warm note
// bending gently downward, quiet and quick.
export function playClose() {
  try {
    const c = getCtx()
    if (!c) return
    const t = c.currentTime + 0.001
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(220.0, t)
    osc.frequency.exponentialRampToValueAtTime(174.61, t + 0.28)

    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1600
    lp.Q.value = 0.4

    const g = c.createGain()
    const FLOOR = 0.0001
    g.gain.setValueAtTime(FLOOR, t)
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.02)
    g.gain.exponentialRampToValueAtTime(FLOOR, t + 0.3)

    osc.connect(lp)
    lp.connect(g)
    g.connect(master)
    osc.start(t)
    osc.stop(t + 0.36)
  } catch (e) {
    // never throw out of an audio cue
  }
}
