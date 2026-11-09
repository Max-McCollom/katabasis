// Browser configuration only. No privileged key is accepted here.
export function readAuthConfiguration(env = import.meta.env ?? {}) {
  const rawUrl = env.VITE_SUPABASE_URL?.trim()
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  if (!rawUrl || !publishableKey?.startsWith('sb_publishable_')) return null
  try {
    const url = new URL(rawUrl)
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) return null
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/') return null
    return Object.freeze({ url: url.origin, publishableKey, downloadUrl: url.origin + '/functions/v1/research-download' })
  } catch { return null }
}
