import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { loadResearchReviewer, reviewResearchAccess } from '../reviewerAccess.js'

// Local fixtures validate the UI contract, not a deployed auth/RLS system.
const userId = '00000000-0000-4000-8000-000000000001'
const materialId = '00000000-0000-4000-8000-000000000002'
const request = { user_id: userId, email: 'reader@example.test', display_name: 'Test reader', status: 'pending', email_confirmed: true, material_ids: [] }
const material = { id: materialId, title: 'Synthetic research file', summary: 'Local fixture only', file_type: 'PDF' }

function fixture({ confirmed = true, reviewer = true, permissionError = null, mutationError = null, listError = null } = {}) {
  const calls = []
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: userId, email_confirmed_at: confirmed ? '2026-11-08T00:00:00Z' : null, user_metadata: { reviewer: true } } } }) },
    rpc: async (name, args) => {
      calls.push({ name, args })
      if (name === 'research_is_reviewer') return { data: reviewer, error: permissionError }
      if (name === 'list_research_access_requests') return { data: [request], error: listError }
      if (name === 'list_research_review_materials') return { data: [material] }
      if (name === 'review_research_access') return { data: request, error: mutationError }
      assert.fail('Unexpected RPC')
    },
  }
  return { client, calls }
}

test('unconfirmed account cannot load owner review even with self-reported metadata', async () => {
  const { client, calls } = fixture({ confirmed: false })
  assert.deepEqual(await loadResearchReviewer(client), { kind: 'not-reviewer' })
  assert.deepEqual(calls, [])
})

for (const reviewer of [false, null, 'true', 1]) {
  test('review permission ' + String(reviewer) + ' does not authorize review-list calls', async () => {
    const { client, calls } = fixture({ reviewer })
    assert.equal((await loadResearchReviewer(client)).kind, 'not-reviewer')
    assert.deepEqual(calls.map(call => call.name), ['research_is_reviewer'])
  })
}

test('server permission denial never loads requests or materials', async () => {
  const { client, calls } = fixture({ permissionError: { code: '42501', message: 'private diagnostic' } })
  assert.equal((await loadResearchReviewer(client)).kind, 'not-reviewer')
  assert.equal(calls.length, 1)
})

test('verified reviewer loads the two server-filtered lists', async () => {
  const { client, calls } = fixture()
  assert.deepEqual(await loadResearchReviewer(client), { kind: 'reviewer', requests: [request], materials: [material] })
  assert.deepEqual(calls.map(call => call.name), ['research_is_reviewer', 'list_research_access_requests', 'list_research_review_materials'])
})

test('failed reviewer list exposes a safe error rather than partial private records', async () => {
  const { client } = fixture({ listError: { code: '42501', message: 'private diagnostic' } })
  await assert.rejects(loadResearchReviewer(client), error => error.code === 'reviewer_denied' && !error.message.includes('private diagnostic'))
})

test('temporary list failure after verified owner permission allows a safe retry notice', async () => {
  const { client } = fixture({ listError: { code: 'network_failure', message: 'private diagnostic' } })
  await assert.rejects(loadResearchReviewer(client), error => error.reviewerVerified === true && !error.message.includes('private diagnostic'))
})

test('approval sends an explicit deduplicated grant set, including an empty set', async () => {
  const { client, calls } = fixture()
  await reviewResearchAccess(client, userId, 'approved', [materialId, materialId])
  await reviewResearchAccess(client, userId, 'approved', [])
  assert.deepEqual(calls, [
    { name: 'review_research_access', args: { p_user_id: userId, p_status: 'approved', p_material_ids: [materialId] } },
    { name: 'review_research_access', args: { p_user_id: userId, p_status: 'approved', p_material_ids: [] } },
  ])
})

for (const status of ['rejected', 'revoked']) {
  test(status + ' decision never sends grants', async () => {
    const { client, calls } = fixture()
    await reviewResearchAccess(client, userId, status, [materialId])
    assert.deepEqual(calls[0].args.p_material_ids, [])
  })
}

test('invalid status and malformed identifiers do not invoke a mutation', async () => {
  const { client, calls } = fixture()
  for (const args of [[userId, 'pending', []], ['invalid', 'approved', []], [userId, 'approved', ['invalid']]]) {
    await assert.rejects(reviewResearchAccess(client, ...args), error => error.code === 'invalid_review')
  }
  assert.equal(calls.length, 0)
})

test('server rejects a review without optimistic success or raw error disclosure', async () => {
  const { client } = fixture({ mutationError: { code: '42501', message: 'private diagnostic' } })
  await assert.rejects(reviewResearchAccess(client, userId, 'approved', []), error => error.code === 'reviewer_denied' && !error.message.includes('private diagnostic'))
})

let components, outputDirectory
before(async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  outputDirectory = await mkdtemp(join(root, '.test-build-'))
  const bundle = join(outputDirectory, 'reviewer.mjs')
  await build({ entryPoints: [join(root, 'ReviewerPanel.jsx')], outfile: bundle, bundle: true, platform: 'node', format: 'esm', jsx: 'automatic', external: ['react', 'react/*'], loader: { '.css': 'empty' } })
  components = await import(pathToFileURL(bundle).href)
})
after(async () => { if (outputDirectory) await rm(outputDirectory, { recursive: true, force: true }) })

test('review panel does not render requests before server permission check', () => {
  assert.equal(renderToStaticMarkup(createElement(components.default, { client: fixture().client, userId })), '')
})

test('zero-file approval explicitly grants no private file access', () => {
  const html = renderToStaticMarkup(createElement(components.ReviewRequest, { request, materials: [] }))
  assert.match(html, /Approve without files/)
  assert.match(html, /no private file access/)
  assert.match(html, /replaces any previous file selection/)
})

test('review form preselects only currently available granted materials', () => {
  const html = renderToStaticMarkup(createElement(components.ReviewRequest, { request: { ...request, status: 'approved', material_ids: [materialId, userId] }, materials: [material] }))
  assert.match(html, /checked=""/)
  assert.match(html, /1 file selected/)
  assert.match(html, /Revoke access/)
  assert.doesNotMatch(html, /storage_path|research-private|https:\/\//)
})

test('unconfirmed request cannot submit approval', () => {
  const html = renderToStaticMarkup(createElement(components.ReviewRequest, { request: { ...request, email_confirmed: false }, materials: [material] }))
  assert.match(html, /Email confirmation is required/)
  assert.match(html, /<fieldset disabled=""/)
})
