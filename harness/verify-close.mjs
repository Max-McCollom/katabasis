// Close-path verification: a real click on the close button (which is also a
// <10px tap near a live inspectable trigger) must CLOSE and stay closed, not
// re-launch via the global tap-to-inspect handler.
import puppeteer from 'puppeteer-core'
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function boot() {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true,
    args: ['--no-sandbox', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('http://localhost:5173/?solve=1', { waitUntil: 'networkidle0' })
  for (let i = 0; i < 80; i++) { if (await page.evaluate(() => !!window.__kbx?.ready)) break; await sleep(150) }
  return { browser, page, errors }
}
const cam = (p) => p.evaluate(() => window.__kbx.getCam())

// === game close via the Return button while standing on the orrery trigger ===
{
  const { browser, page, errors } = await boot()
  await sleep(3600)
  await page.keyboard.down('KeyW')
  for (let i = 0; i < 40; i++) { const c = await cam(page); if (c[2] <= 3) break; await sleep(250) }
  await page.keyboard.up('KeyW')
  await sleep(300)
  await page.keyboard.press('KeyE')
  await sleep(700)
  await page.evaluate(() => document.querySelectorAll('.kb-astro__ring')[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await sleep(700)
  await page.click('.kb-game__btn') // "Return to the hall" - a real click == a tap on the trigger
  await sleep(400)
  const closed1 = await page.evaluate(() => !document.querySelector('.kb-game'))
  await sleep(900)
  const staysClosed = await page.evaluate(() => !document.querySelector('.kb-game'))
  const a = await cam(page); await page.keyboard.down('KeyS'); await sleep(1000); await page.keyboard.up('KeyS'); await sleep(300)
  const b = await cam(page)
  console.log('GAME close: closed=', closed1, '| stays closed (no relaunch)=', staysClosed, '| resume moved=', Math.hypot(a[0] - b[0], a[2] - b[2]).toFixed(2))
  console.log('  errors:', errors.length ? errors.join('|') : 'none')
  await browser.close()
}

// === read close via the Withdraw button while standing on the lectern ===
{
  const { browser, page, errors } = await boot()
  await sleep(3600)
  await page.keyboard.down('KeyW'); await sleep(1900); await page.keyboard.up('KeyW'); await sleep(400)
  await page.keyboard.press('KeyE')
  await sleep(800)
  const opened = await page.evaluate(() => document.querySelector('.kb-read__title')?.innerText)
  await page.click('.kb-read__close') // "Withdraw" - real click == tap near the lectern trigger
  await sleep(400)
  const closed = await page.evaluate(() => !document.querySelector('.kb-read'))
  await sleep(900)
  const staysClosed = await page.evaluate(() => !document.querySelector('.kb-read'))
  const a = await cam(page); await page.keyboard.down('KeyW'); await sleep(900); await page.keyboard.up('KeyW'); await sleep(300)
  const b = await cam(page)
  console.log('READ close: opened=', JSON.stringify(opened), '| closed=', closed, '| stays closed=', staysClosed, '| resume moved=', Math.hypot(a[0] - b[0], a[2] - b[2]).toFixed(2))
  console.log('  errors:', errors.length ? errors.join('|') : 'none')
  await browser.close()
}
