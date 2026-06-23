// UI harness: boots LIVE mode and verifies the DOM layers (frozen-copy reading
// overlay + the minigame) render over the world. Triggers them via window.__kbx.
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = 'http://localhost:5173/'
const OUT = process.env.OUT || '.'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const errors = []

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
page.on('console', (m) => m.type() === 'error' && errors.push('CONSOLE: ' + m.text()))
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))

await page.goto(URL, { waitUntil: 'networkidle0' })
let ready = false
for (let i = 0; i < 80; i++) {
  ready = await page.evaluate(() => !!(window.__kbx && window.__kbx.ready))
  if (ready) break
  await sleep(150)
}
console.log('ready:', ready, '| gpu:', await page.evaluate(() => window.__kbx?.gpu))
await sleep(600)
await page.screenshot({ path: `${OUT}/ui-spawn.png` })

// frozen-copy reading overlay
await page.evaluate(() => window.__kbx.demoRead())
await sleep(900)
await page.screenshot({ path: `${OUT}/ui-read.png` })
const readText = await page.evaluate(() => document.querySelector('.kb-read__body')?.innerText?.slice(0, 60))
console.log('read overlay text:', JSON.stringify(readText))

// minigame
await page.evaluate(() => window.__kbx.clearUI())
await sleep(200)
await page.evaluate(() => window.__kbx.launch('astrolabe'))
await sleep(900)
await page.screenshot({ path: `${OUT}/ui-game.png` })
const hasAstro = await page.evaluate(() => !!document.querySelector('.kb-astro'))
// click an outer ring to confirm interactivity (it should rotate)
await page.evaluate(() => {
  const rings = document.querySelectorAll('.kb-astro__ring')
  if (rings[3]) rings[3].dispatchEvent(new MouseEvent('click', { bubbles: true }))
})
await sleep(700)
await page.screenshot({ path: `${OUT}/ui-game-turn.png` })
console.log('minigame rendered:', hasAstro)

console.log('errors:', errors.length ? '\n  ' + errors.join('\n  ') : 'none')
await browser.close()
