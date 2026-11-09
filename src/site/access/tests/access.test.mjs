import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { build } from 'esbuild'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readAuthConfiguration } from '../authClient.js'
import { AccessError, canResetPassword, downloadResearchMaterial, loadResearchAccess, recoveryAuthorization, resetRecoveryPassword } from '../researchAccess.js'

// Fixtures are local interface checks, never real provider/RLS acceptance.
const materialId = '00000000-0000-4000-8000-000000000001'
const material = { id: materialId, title: 'Synthetic test record', summary: 'Local fixture only', file_type: 'PDF' }
const verifiedUser = { id: 'fixture-user', email: 'reader@example.test', email_confirmed_at: '2026-11-08T00:00:00Z', user_metadata: {} }
const configuration = { url: 'https://example.supabase.co', publishableKey: 'sb_publishable_fixture', downloadUrl: 'https://example.supabase.co/functions/v1/research-download' }

function fixture({ user = verifiedUser, status = 'pending', hasRequest = true, session = { access_token: 'fixture-session-token' } } = {}) {
  const calls = []
  let request = hasRequest ? { user_id: user?.id, status } : null
  const client = {
    auth: { getUser: async () => ({ data: { user } }), getSession: async () => ({ data: { session } }) },
    rpc: async (name, args) => { calls.push({ rpc: name, args }); request = { user_id: user.id, status: 'pending' }; return { error: null } },
    from(table) {
      calls.push({ table })
      return {
        select(columns) { calls.push({ columns }); return this },
        eq(field, value) { calls.push({ field, value }); return this },
        order() { return this },
        abortSignal() { return table === 'research_materials' ? Promise.resolve({ data: [material], error: null }) : this },
        maybeSingle: async () => ({ data: request, error: null }),
      }
    },
  }
  return { client, calls }
}

test('unconfigured or privileged-key configurations fail closed', () => {
  assert.equal(readAuthConfiguration({}), null)
  assert.equal(readAuthConfiguration({ VITE_SUPABASE_URL: configuration.url, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_not_allowed' }), null)
  assert.equal(readAuthConfiguration({ VITE_SUPABASE_URL: 'http://public.example', VITE_SUPABASE_PUBLISHABLE_KEY: configuration.publishableKey }), null)
  assert.deepEqual(readAuthConfiguration({ VITE_SUPABASE_URL: configuration.url, VITE_SUPABASE_PUBLISHABLE_KEY: configuration.publishableKey }), configuration)
})

test('unconfirmed email does not query a request or catalog', async () => {
  const { client, calls } = fixture({ user: { ...verifiedUser, email_confirmed_at: null } })
  assert.equal((await loadResearchAccess(client)).kind, 'unconfirmed')
  assert.equal(calls.length, 0)
})

for (const status of ['pending', 'rejected', 'revoked']) {
  test(status + ' request never loads material metadata', async () => {
    const { client, calls } = fixture({ status })
    const result = await loadResearchAccess(client)
    assert.equal(result.kind, status)
    assert.deepEqual(result.materials, [])
    assert.equal(calls.some(call => call.table === 'research_materials'), false)
  })
}

test('unknown approval state is unavailable, not approved', async () => {
  const { client, calls } = fixture({ status: 'unexpected' })
  await assert.rejects(loadResearchAccess(client), error => error instanceof AccessError && error.code === 'review_unavailable')
  assert.equal(calls.some(call => call.table === 'research_materials'), false)
})

test('approved catalog asks RLS for metadata without private storage paths', async () => {
  const { client, calls } = fixture({ status: 'approved' })
  assert.deepEqual((await loadResearchAccess(client)).materials, [material])
  assert.equal(calls.some(call => call.table === 'research_materials'), true)
  assert.equal(calls.some(call => call.columns?.includes('storage_path')), false)
})

test('confirmed signup submits contact details without a client approval field', async () => {
  const { client, calls } = fixture({ hasRequest: false, user: { ...verifiedUser, user_metadata: { display_name: 'Test Reader', contact_phone: null, research_access_requested: true } } })
  assert.equal((await loadResearchAccess(client)).kind, 'pending')
  assert.deepEqual(calls.find(call => call.rpc), { rpc: 'submit_research_access_request', args: { p_display_name: 'Test Reader', p_contact_phone: null } })
})

test('a missing request without signup intent is presented for submission', async () => {
  const { client, calls } = fixture({ hasRequest: false })
  assert.equal((await loadResearchAccess(client)).kind, 'request')
  assert.equal(calls.some(call => call.rpc), false)
})

test('download sends only material ID to authenticated no-store proxy', async () => {
  const { client } = fixture()
  let observed
  const result = await downloadResearchMaterial(client, configuration, materialId, undefined, async (url, init) => {
    observed = { url, init }
    return new Response(new Blob(['local fixture']), { headers: { 'Content-Disposition': 'attachment; filename="test.pdf"' } })
  })
  assert.equal(observed.url, configuration.downloadUrl)
  assert.equal(observed.init.cache, 'no-store')
  assert.equal(observed.init.headers.Authorization, 'Bearer fixture-session-token')
  assert.deepEqual(JSON.parse(observed.init.body), { material_id: materialId })
  assert.equal(result.filename, 'test.pdf')
  assert.equal(await result.blob.text(), 'local fixture')
})

test('expired session performs no download request', async () => {
  const { client } = fixture({ session: null })
  await assert.rejects(downloadResearchMaterial(client, configuration, materialId, undefined, () => assert.fail('must not fetch')), error => error.code === 'session_expired')
})

test('proxy denial produces no file bytes', async () => {
  const { client } = fixture()
  await assert.rejects(downloadResearchMaterial(client, configuration, materialId, undefined, async () => ({ ok: false, status: 403, blob: () => assert.fail('must not read bytes') })), error => error.code === 'access_changed')
})

const normalSession = { user: verifiedUser, access_token: 'fixture-normal-session' }
const recoverySession = { user: verifiedUser, access_token: 'fixture-recovery-session' }

test('restored normal session never authorizes password recovery', async () => {
  const authorization = recoveryAuthorization(null, 'INITIAL_SESSION', normalSession)
  assert.equal(authorization, null)
  assert.equal(canResetPassword(normalSession, authorization), false)
  const client = { auth: { getSession: () => assert.fail('must not inspect or update an unrelated session'), updateUser: () => assert.fail('must not update password') } }
  await assert.rejects(resetRecoveryPassword(client, normalSession, authorization, 'unused local fixture'), error => error.code === 'invalid_recovery')
})

test('authenticated recovery event permits only its current session', async () => {
  const authorization = recoveryAuthorization(null, 'PASSWORD_RECOVERY', recoverySession)
  assert.equal(canResetPassword(recoverySession, authorization), true)
  assert.equal(canResetPassword(normalSession, authorization), false)
  let updated = false
  const client = { auth: {
    getSession: async () => ({ data: { session: recoverySession } }),
    getUser: async () => ({ data: { user: verifiedUser } }),
    updateUser: async () => { updated = true; return { data: { user: verifiedUser } } },
  } }
  await resetRecoveryPassword(client, recoverySession, authorization, 'unused local fixture')
  assert.equal(updated, true)
})

test('identity change clears the recovery authorization', () => {
  const authorization = recoveryAuthorization(null, 'PASSWORD_RECOVERY', recoverySession)
  const changed = { user: { id: 'another-fixture-user' }, access_token: 'different-fixture-session' }
  assert.equal(recoveryAuthorization(authorization, 'SIGNED_IN', changed), null)
  assert.equal(canResetPassword(changed, authorization), false)
})

test('a new normal login for the same user cannot reuse recovery authorization', () => {
  const authorization = recoveryAuthorization(null, 'PASSWORD_RECOVERY', recoverySession)
  assert.equal(recoveryAuthorization(authorization, 'SIGNED_IN', normalSession), null)
})

test('token refresh preserves recovery only for the same user', () => {
  const authorization = recoveryAuthorization(null, 'PASSWORD_RECOVERY', recoverySession)
  const refreshed = { ...recoverySession, access_token: 'refreshed-fixture-recovery-session' }
  const next = recoveryAuthorization(authorization, 'TOKEN_REFRESHED', refreshed)
  assert.equal(canResetPassword(refreshed, next), true)
  assert.equal(canResetPassword(recoverySession, next), false)
  assert.equal(recoveryAuthorization(authorization, 'TOKEN_REFRESHED', { ...refreshed, user: { id: 'another-fixture-user' } }), null)
})

for (const event of ['SIGNED_OUT', 'RECOVERY_COMPLETED', 'RECOVERY_CANCELLED']) {
  test(event + ' consumes recovery authorization', () => {
    const authorization = recoveryAuthorization(null, 'PASSWORD_RECOVERY', recoverySession)
    const cleared = recoveryAuthorization(authorization, event, recoverySession)
    assert.equal(cleared, null)
    assert.equal(canResetPassword(recoverySession, cleared), false)
  })
}

test('session or server-identity mismatch prevents a password update', async () => {
  const authorization = recoveryAuthorization(null, 'PASSWORD_RECOVERY', recoverySession)
  for (const changed of [true, false]) {
    const client = { auth: {
      getSession: async () => ({ data: { session: changed ? normalSession : recoverySession } }),
      getUser: async () => ({ data: { user: null }, error: { code: 'expired' } }),
      updateUser: () => assert.fail('must not update after a failed recovery check'),
    } }
    await assert.rejects(resetRecoveryPassword(client, recoverySession, authorization, 'unused local fixture'), error => error.code === 'invalid_recovery')
  }
})

let components
let outputDirectory
before(async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  outputDirectory = await mkdtemp(join(root, '.test-build-'))
  const bundle = join(outputDirectory, 'component.mjs')
  await build({ entryPoints: [join(root, 'PrivateAccess.jsx')], outfile: bundle, bundle: true, platform: 'node', format: 'esm', jsx: 'automatic', external: ['react', 'react/*', '@supabase/supabase-js'], loader: { '.css': 'empty' } })
  components = await import(pathToFileURL(bundle).href)
})
after(async () => { if (outputDirectory) await rm(outputDirectory, { recursive: true, force: true }) })

test('default unconfigured page contains no credential form', () => {
  const html = renderToStaticMarkup(createElement(components.default))
  assert.match(html, /not configured/)
  assert.doesNotMatch(html, /<input|<form/)
})

test('expired/reused recovery link with an existing normal session exposes no reset form', () => {
  const authorization = recoveryAuthorization(null, 'INITIAL_SESSION', normalSession)
  const html = renderToStaticMarkup(createElement(components.RecoveryPanel, {
    authorized: canResetPassword(normalSession, authorization), hasSession: true,
    passwordFields: createElement('input', { type: 'password' }),
  }))
  assert.match(html, /Request a new reset link/)
  assert.doesNotMatch(html, /<form|<input|Save password/)
})

test('valid recovery event exposes the reset form for its session', () => {
  const authorization = recoveryAuthorization(null, 'PASSWORD_RECOVERY', recoverySession)
  const html = renderToStaticMarkup(createElement(components.RecoveryPanel, {
    authorized: canResetPassword(recoverySession, authorization), hasSession: true,
    passwordFields: createElement('input', { type: 'password' }),
  }))
  assert.match(html, /<form/)
  assert.match(html, /Save password/)
})

for (const kind of ['pending', 'rejected', 'revoked', 'unconfirmed', 'unknown']) {
  test(kind + ' interface never renders supplied material data', () => {
    const html = renderToStaticMarkup(createElement(components.AccessState, { view: { kind, materials: [material] } }))
    assert.doesNotMatch(html, /Synthetic test record/)
    assert.doesNotMatch(html, /Download/)
  })
}

test('approved interface renders granted metadata and download action without remote file URL', () => {
  const html = renderToStaticMarkup(createElement(components.AccessState, { view: { kind: 'approved', materials: [material] } }))
  assert.match(html, /Synthetic test record/)
  assert.match(html, /Download/)
  assert.doesNotMatch(html, /storage_path|https:\/\//)
})
