// The whole visitor arc in ONE session, and crucially the RESUME path: after
// every read/minigame, confirm control comes back (press W, camera moves). A
// stuck-after-first-interaction bug would be a total-experience failure.
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = process.env.OUT || '.'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('http://localhost:5173/estate?solve=1', { waitUntil: 'networkidle0' }) // solve seed: each game is one click from win
for (let i = 0; i < 80; i++) {
  if (await page.evaluate(() => !!window.__kbx?.ready)) break
  await sleep(150)
}
const cam = () => page.evaluate(() => window.__kbx.getCam())
const hold = async (key, ms) => { await page.keyboard.down(key); await sleep(ms); await page.keyboard.up(key) }
async function resumes(label) {
  const a = await cam()
  await hold('KeyW', 1100)
  await sleep(300)
  const b = await cam()
  const moved = Math.hypot(a[0] - b[0], a[2] - b[2])
  console.log(`   RESUME after ${label}: camera moved ${moved.toFixed(2)} (expect > 1 = control returned)`)
}

await sleep(3600) // past the arrival intro lock

// 1. hall lectern -> The Threshold -> Escape -> resume
await hold('KeyW', 1900)
await sleep(400)
console.log('1 hall prompt:', JSON.stringify(await page.evaluate(() => document.querySelector('.kb-prompt')?.innerText?.trim())))
await page.keyboard.press('KeyE')
await sleep(900)
console.log('  read:', JSON.stringify(await page.evaluate(() => document.querySelector('.kb-read__title')?.innerText)))
await page.keyboard.press('Escape')
await sleep(700)
await resumes('read')

// 2. orrery -> Astrolabe -> win -> exit -> resume
await hold('KeyW', 3600)
await sleep(400)
console.log('2 orrery prompt:', JSON.stringify(await page.evaluate(() => document.querySelector('.kb-prompt')?.innerText?.trim())))
await page.keyboard.press('KeyE')
await sleep(700)
await page.evaluate(() => document.querySelectorAll('.kb-astro__ring')[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true })))
await sleep(700)
console.log('  win:', JSON.stringify(await page.evaluate(() => document.querySelector('.kb-game__win')?.innerText)))
await page.evaluate(() => window.__kbx.clearUI()) // leave the game
await sleep(700)
await resumes('minigame')

// 3. descend to the landing -> The Descent -> Escape -> resume
await hold('KeyW', 20000)
await sleep(1000)
const d = await cam()
console.log('3 descended y:', d[1].toFixed(2), 'z:', d[2].toFixed(2))
await hold('KeyA', 1700)
await sleep(500)
console.log('  descent prompt:', JSON.stringify(await page.evaluate(() => document.querySelector('.kb-prompt')?.innerText?.trim())))
await page.keyboard.press('KeyE')
await sleep(900)
console.log('  read:', JSON.stringify(await page.evaluate(() => document.querySelector('.kb-read__title')?.innerText)))
await page.keyboard.press('Escape')
await sleep(700)
await resumes('descent read')

// 4. braziers -> win -> exit
await hold('KeyD', 2600)
await sleep(500)
console.log('4 brazier prompt:', JSON.stringify(await page.evaluate(() => document.querySelector('.kb-prompt')?.innerText?.trim())))
await page.keyboard.press('KeyE')
await sleep(700)
await page.evaluate(() => document.querySelectorAll('.kb-braz__node')[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true })))
await sleep(700)
console.log('  win:', JSON.stringify(await page.evaluate(() => document.querySelector('.kb-game__win')?.innerText)))
await page.evaluate(() => window.__kbx.clearUI())
await sleep(600)
await resumes('descent minigame')

console.log('progress:', await page.evaluate(() => localStorage.getItem('katabasis-progress')))
console.log('pageerrors:', errors.length ? errors.join(' | ') : 'none')
await browser.close()
