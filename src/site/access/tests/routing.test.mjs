import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

let outputDirectory
const pages = {}
before(async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  outputDirectory = await mkdtemp(join(root, '.test-build-'))
  for (const [name, env] of Object.entries({
    unconfigured: {},
    configured: { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fixture' },
  })) {
    const bundle = join(outputDirectory, name + '.mjs')
    await build({ entryPoints: [join(root, '..', 'PublicSite.jsx')], outfile: bundle, bundle: true, platform: 'node', format: 'esm', jsx: 'automatic', external: ['react', 'react/*', '@supabase/supabase-js'], loader: { '.css': 'empty' }, define: { 'import.meta.env': JSON.stringify(env) } })
    pages[name] = (await import(pathToFileURL(bundle).href)).default
  }
})
after(async () => { delete globalThis.window; if (outputDirectory) await rm(outputDirectory, { recursive: true, force: true }) })

function render(name, pathname) {
  globalThis.window = { location: { pathname, search: '', hash: '' } }
  return renderToStaticMarkup(createElement(pages[name]))
}

test('configured public shell links to the research-access route', () => {
  const html = render('configured', '/')
  assert.equal((html.match(/href="\/research-access\/"/g) || []).length, 2)
  assert.match(html, /Primary navigation/)
  assert.match(html, /Research access/)
})

test('unconfigured public shell omits research-access navigation', () => {
  assert.doesNotMatch(render('unconfigured', '/'), /href="\/research-access\/"/)
})

test('research-access route retains the normal shell and never falls through to 404', () => {
  const html = render('configured', '/research-access/')
  assert.match(html, /Research access/)
  assert.match(html, /site-header/)
  assert.match(html, /site-footer/)
  assert.doesNotMatch(html, /Page not found/)
})
