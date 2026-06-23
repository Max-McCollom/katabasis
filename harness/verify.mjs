// Real-path verification: drives the LIVE app the way a visitor would (key
// dispatch, real proximity, real win) rather than forcing store state.
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = process.env.OUT || '.'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function boot(url) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(url, { waitUntil: 'networkidle0' })
  for (let i = 0; i < 80; i++) {
    if (await page.evaluate(() => !!(window.__kbx && window.__kbx.ready))) break
    await sleep(150)
  }
  return { browser, page, errors }
}

// --- 1: arrival veil + movement + proximity prompt + real inspect path ---
{
  const { browser, page, errors } = await boot('http://localhost:5173/')
  await sleep(1100)
  await page.screenshot({ path: `${OUT}/verify-arrival.png` }) // veil should still be up (<2.9s)
  const veil = await page.evaluate(() => !!document.querySelector('.kb-veil:not(.is-gone)'))
  console.log('1. arrival veil visible at ~1.1s :', veil)

  await sleep(3200) // past the intro lock
  const before = await page.evaluate(() => window.__kbx.getCam())
  await page.keyboard.down('KeyW')
  await sleep(1900)
  await page.keyboard.up('KeyW')
  const after = await page.evaluate(() => window.__kbx.getCam())
  const dz = before[2] - after[2]
  console.log('2. forward W moved camera dz =', dz.toFixed(2), '(expect > 4: roam works)')

  await sleep(300)
  await page.screenshot({ path: `${OUT}/verify-prompt.png` })
  const prompt = await page.evaluate(() => document.querySelector('.kb-prompt')?.innerText?.trim())
  console.log('3. proximity prompt at lectern  :', JSON.stringify(prompt))

  await page.keyboard.press('KeyE')
  await sleep(1000)
  await page.screenshot({ path: `${OUT}/verify-read.png` })
  const readOpen = await page.evaluate(() => document.querySelector('.kb-read__title')?.innerText)
  console.log('4. E opened the inscription     :', JSON.stringify(readOpen))
  console.log('   pageerrors:', errors.length ? errors.join(' | ') : 'none')
  await browser.close()
}

// --- 5: collision (strafe into a wall, expect x clamped) ---
{
  const { browser, page } = await boot('http://localhost:5173/')
  await sleep(3600)
  await page.keyboard.down('KeyD')
  await sleep(3000)
  await page.keyboard.up('KeyD')
  const pos = await page.evaluate(() => window.__kbx.getCam())
  console.log('5. strafe-into-wall final x =', pos[0].toFixed(2), '(expect |x| < 10.0: wall stops it)')
  await browser.close()
}

// --- 6: minigame WIN state (seed one click from solved, click, see win) ---
{
  const { browser, page } = await boot('http://localhost:5173/?solve=1')
  await page.evaluate(() => window.__kbx.launch('astrolabe'))
  await sleep(700)
  await page.evaluate(() => {
    const r = document.querySelectorAll('.kb-astro__ring')
    r[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await sleep(900)
  const win = await page.evaluate(() => document.querySelector('.kb-game__win')?.innerText)
  await page.screenshot({ path: `${OUT}/verify-win.png` })
  console.log('6. minigame win after solving   :', JSON.stringify(win))
  await browser.close()
}
