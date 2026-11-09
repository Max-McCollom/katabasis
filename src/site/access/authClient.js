import { createClient } from '@supabase/supabase-js'
import { readAuthConfiguration } from './authConfiguration.js'
export { readAuthConfiguration } from './authConfiguration.js'

let client

export function getAuthClient() {
  const configuration = readAuthConfiguration()
  if (!configuration) return null
  client ??= createClient(configuration.url, configuration.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'implicit',
      storageKey: 'katabasis-research-access',
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  })
  return client
}

export function accessReturnUrl(returnPath = '/research-access/', recovery = false) {
  const origin = window.location.origin
  const url = new URL(returnPath, origin)
  if (url.origin !== origin) throw new Error('The access return path must use this site.')
  url.hash = ''
  url.search = ''
  if (recovery) url.searchParams.set('access', 'recovery')
  return url.href
}
