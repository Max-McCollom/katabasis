// Ambient room tone. NOTE: this synthesizes sound with the Web Audio API rather
// than playing Howler-loaded assets, because no audio files could be authored
// or verified this run. It is real, self-contained sound (a low drone + an airy
// bed) that darkens as you descend. Howler spatial audio with authored room-tone
// and footstep assets is the intended upgrade; see docs/DECISIONS.md.

let ctx = null
let nf = null
let master = null
let started = false

export function startAmbient() {
  if (started) return
  started = true
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    const drone = ctx.createGain()
    drone.gain.value = 0.13
    const o1 = ctx.createOscillator()
    o1.type = 'sine'
    o1.frequency.value = 55
    const o2 = ctx.createOscillator()
    o2.type = 'sine'
    o2.frequency.value = 55 * 1.004
    const o3 = ctx.createOscillator()
    o3.type = 'triangle'
    o3.frequency.value = 82.41
    o1.connect(drone)
    o2.connect(drone)
    o3.connect(drone)

    // airy bed (filtered noise)
    const len = ctx.sampleRate * 2
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.5
    const noise = ctx.createBufferSource()
    noise.buffer = buf
    noise.loop = true
    nf = ctx.createBiquadFilter()
    nf.type = 'bandpass'
    nf.frequency.value = 420
    nf.Q.value = 0.6
    const ng = ctx.createGain()
    ng.gain.value = 0.05
    noise.connect(nf)
    nf.connect(ng)

    // slow breathing on the drone
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07
    const lg = ctx.createGain()
    lg.gain.value = 0.04
    lfo.connect(lg)
    lg.connect(drone.gain)

    drone.connect(master)
    ng.connect(master)
    o1.start()
    o2.start()
    o3.start()
    noise.start()
    lfo.start()
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3)
  } catch (e) {
    started = false
  }
}

// k in [0,1]: 0 at the entrance, 1 at the deepest point. Darkens the bed.
export function setDepth(k) {
  if (!ctx || !nf) return
  const kk = Math.max(0, Math.min(1, k))
  nf.frequency.value = 430 - kk * 250
}
