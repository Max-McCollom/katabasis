// STEP 4 verification: the FPS-degrade path actually fires + recovers, and the
// mobile/touch path works end to end (joystick move + tap-to-inspect).
import puppeteer from 'puppeteer-core'
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = process.env.OUT || '.'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function boot(viewport) {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true,
    args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'],
  })
  const page = await browser.newPage()
  await page.setViewport(viewport)
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
  for (let i = 0; i < 80; i++) { if (await page.evaluate(() => !!window.__kbx?.ready)) break; await sleep(150) }
  return { browser, page, errors }
}

// === A. FPS degrade fires + recovers ===
{
  const { browser, page, errors } = await boot({ width: 1280, height: 800 })
  await sleep(1500)
  const q0 = await page.evaluate(() => { const q = window.__kbx.quality(); return { post: q.post, dpr: q.dpr, fogMul: q.fogMul } })
  await page.evaluate(() => window.__kbx.forceQuality(2))
  await sleep(400)
  await page.screenshot({ path: `${OUT}/harden-degraded.png` })
  const q2 = await page.evaluate(() => { const q = window.__kbx.quality(); return { post: q.post, dpr: q.dpr, fogMul: q.fogMul } })
  await page.evaluate(() => window.__kbx.forceQuality(0))
  await sleep(400)
  const qr = await page.evaluate(() => { const q = window.__kbx.quality(); return { post: q.post, dpr: q.dpr, fogMul: q.fogMul } })
  console.log('A0 full   :', JSON.stringify(q0))
  console.log('A2 forced2:', JSON.stringify(q2), '(expect post:false, dpr:1, fogMul:1.5)')
  console.log('Ar recover:', JSON.stringify(qr), '(expect post:true, dpr:2, fogMul:1)')
  console.log('   degrade fires:', q2.post === false && q2.dpr === 1, '| recovers:', qr.post === true && qr.dpr === 2)
  console.log('   errors:', errors.length ? errors.join('|') : 'none')
  await browser.close()
}

// === B. mobile/touch end to end ===
{
  const { browser, page, errors } = await boot({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const coarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches)
  const joy = await page.evaluate(() => !!document.querySelector('.kb-joy'))
  console.log('B coarse:', coarse, '| joystick:', joy)
  await sleep(3600)
  const a = await page.evaluate(() => window.__kbx.getCam())
  // joystick forward toward the hall lectern (z 32 -> ~22)
  await page.evaluate(() => {
    const el = document.querySelector('.kb-joy'); const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const ev = (t, y) => el.dispatchEvent(new PointerEvent(t, { pointerId: 9, clientX: cx, clientY: y, bubbles: true, pointerType: 'touch' }))
    ev('pointerdown', cy); ev('pointermove', cy - 46)
  })
  for (let i = 0; i < 30; i++) { const c = await page.evaluate(() => window.__kbx.getCam()); if (c[2] <= 23) break; await sleep(200) }
  await page.evaluate(() => document.querySelector('.kb-joy').dispatchEvent(new PointerEvent('pointerup', { pointerId: 9, bubbles: true, pointerType: 'touch' })))
  const b = await page.evaluate(() => window.__kbx.getCam())
  console.log('  joystick moved dz:', (a[2] - b[2]).toFixed(2), '(expect > 4)')
  const prompt = await page.evaluate(() => document.querySelector('.kb-prompt')?.innerText?.trim())
  console.log('  prompt at lectern:', JSON.stringify(prompt))
  // tap centre of screen (a press without drag) -> inspect
  await page.evaluate(() => {
    const c = document.querySelector('canvas')
    const x = window.innerWidth / 2, y = window.innerHeight / 2
    c.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 3, clientX: x, clientY: y, bubbles: true, pointerType: 'touch' }))
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 3, clientX: x, clientY: y, bubbles: true, pointerType: 'touch' }))
  })
  await sleep(900)
  console.log('  tap-to-inspect opened:', JSON.stringify(await page.evaluate(() => document.querySelector('.kb-read__title')?.innerText)))
  console.log('  errors:', errors.length ? errors.join('|') : 'none')
  await browser.close()
}
