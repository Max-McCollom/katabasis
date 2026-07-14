import { copyFileSync, mkdirSync } from 'node:fs'

const routes = [
  'system',
  'work',
  'work/data-mismatch',
  'work/narrowed-claim',
  'notes',
  'notes/safe-refusal',
  'about',
  'archive',
  'estate',
]

for (const route of routes) {
  const directory = `dist/${route}`
  mkdirSync(directory, { recursive: true })
  copyFileSync('dist/index.html', `${directory}/index.html`)
}

copyFileSync('dist/index.html', 'dist/404.html')
