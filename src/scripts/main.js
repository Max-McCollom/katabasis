import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const root = document.documentElement
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Progressive enhancement. With no JS or reduced motion, the page is the
   static shell: solid register grounds, all copy visible, native scroll. The
   motion layer is added only when it is safe to. If this script never runs,
   nothing is hidden. */
if (!reduceMotion) {
  root.classList.add('motion')
  initMotion()
}

function cssVar(name) {
  return getComputedStyle(root).getPropertyValue(name).trim()
}

function initMotion() {
  const backdrop = document.getElementById('backdrop')

  /* Smooth scroll. Lenis is driven by a single GSAP ticker (no second RAF),
     and ScrollTrigger updates on every Lenis scroll. */
  const lenis = new Lenis({ lerp: 0.1 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  /* Scroll weight. Resistance increases through the descent (lower lerp =
     heavier) to the deepest point, then lightens on the return (higher lerp).
     Held inside the brief's 0.08-0.12 band. NADIR is the approximate scroll
     fraction of the deepest point; it is feel, not physics, and is yours to
     tune. */
  const NADIR = 0.6
  lenis.on('scroll', () => {
    const p = lenis.progress || 0
    lenis.options.lerp =
      p <= NADIR
        ? 0.105 - (0.105 - 0.08) * (p / NADIR)
        : 0.08 + (0.12 - 0.08) * ((p - NADIR) / (1 - NADIR))
  })

  /* The Doré progression. A single fixed backdrop crossfades through the
     registers, one per section. Each section claims its register as it reaches
     centre (entering either direction), so the colour is always correct and
     transitions are timed dissolves rather than hard cuts. The eventual
     cinematic clips (Phase 4) slot in over this same backdrop. */
  const registers = [
    ['.hero', '--stone-bg'],
    ['.chapter--threshold', '--stone-bg'],
    ['.chapter--descent', '--descent-bg'],
    ['.chapter--nadir', '--nadir-bg'],
    ['.chapter--return', '--return-bg'],
    ['.creator', '--close-bg'],
  ]
  gsap.set(backdrop, { backgroundColor: cssVar('--stone-bg') })
  registers.forEach(([selector, varName]) => {
    const el = document.querySelector(selector)
    if (!el) return
    const color = cssVar(varName)
    const toColor = () =>
      gsap.to(backdrop, {
        backgroundColor: color,
        duration: 0.7,
        ease: 'power1.inOut',
        overwrite: 'auto',
      })
    ScrollTrigger.create({
      trigger: el,
      start: 'top center',
      end: 'bottom center',
      onEnter: toColor,
      onEnterBack: toColor,
    })
  })

  /* Each chapter pins, reveals its copy, holds, then dissolves before release.
     The copy is only visible while its register is settled, so the background
     never crossfades under live text. Scrubbed, so it is reversible and tied
     to scroll position rather than playing on its own. The hold is the gap
     between the two tweens. */
  gsap.utils.toArray('main .chapter').forEach((section) => {
    const content = section.querySelector('.measure')
    gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
        },
      })
      .fromTo(
        content,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.3 },
        0.18,
      )
      .to(content, { autoAlpha: 0, y: -16, ease: 'power2.in', duration: 0.2 }, 0.82)
  })

  /* The creator is the settled close: one quiet reveal, no pin, copy stays. */
  const creator = document.querySelector('.creator .measure')
  if (creator) {
    gsap.fromTo(
      creator,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        ease: 'power2.out',
        duration: 0.9,
        scrollTrigger: { trigger: '.creator', start: 'top 78%' },
      },
    )
  }
}
