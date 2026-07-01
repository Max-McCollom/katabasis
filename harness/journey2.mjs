// Closes two gaps from the journey: (a) the orrery (hall minigame) launching via
// real proximity, (b) resume after the DESCENT read/minigame, tested by moving
// BACKWARD (S) so the balustrade can't mask it.
import puppeteer from 'puppeteer-core'
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('http://localhost:5173/estate?solve=1', { waitUntil: 'networkidle0' })
for (let i = 0; i < 80; i++) { if (await page.evaluate(() => !!window.__kbx?.ready)) break; await sleep(150) }
const cam = () => page.evaluate(() => window.__kbx.getCam())
const prompt = () => page.evaluate(() => document.querySelector('.kb-prompt')?.innerText?.trim())
await sleep(3600)

// --- A. walk to the ORRERY (z=2), polling so we stop on it, then launch + win ---
await page.keyboard.down('KeyW')
for (let i = 0; i < 40; i++) { const c = await cam(); if (c[2] <= 3) break; await sleep(250) }
await page.keyboard.up('KeyW')
await sleep(400)
console.log('A orrery prompt:', JSON.stringify(await prompt()))
await page.keyboard.press('KeyE')
await sleep(700)
await page.evaluate(() => document.querySelectorAll('.kb-astro__ring')[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true })))
await sleep(700)
console.log('  astrolabe win:', JSON.stringify(await page.evaluate(() => document.querySelector('.kb-game__win')?.innerText)))
await page.evaluate(() => window.__kbx.clearUI())
await sleep(700)
{
  const a = await cam(); await page.keyboard.down('KeyS'); await sleep(1100); await page.keyboard.up('KeyS'); await sleep(300)
  const b = await cam()
  console.log('  RESUME after minigame (backward S):', Math.hypot(a[0] - b[0], a[2] - b[2]).toFixed(2), '(expect > 1)')
}

// --- B. descend, read The Descent, Escape, resume by moving BACKWARD (S) ---
await page.keyboard.down('KeyW'); await sleep(20000); await page.keyboard.up('KeyW'); await sleep(1000)
await page.keyboard.down('KeyA'); await sleep(1700); await page.keyboard.up('KeyA'); await sleep(500)
console.log('B descent prompt:', JSON.stringify(await prompt()))
await page.keyboard.press('KeyE'); await sleep(900)
console.log('  read:', JSON.stringify(await page.evaluate(() => document.querySelector('.kb-read__title')?.innerText)))
await page.keyboard.press('Escape'); await sleep(700)
{
  const a = await cam(); await page.keyboard.down('KeyS'); await sleep(1100); await page.keyboard.up('KeyS'); await sleep(300)
  const b = await cam()
  console.log('  RESUME after descent read (backward S):', Math.hypot(a[0] - b[0], a[2] - b[2]).toFixed(2), '(expect > 1)')
}
console.log('pageerrors:', errors.length ? errors.join(' | ') : 'none')
await browser.close()
