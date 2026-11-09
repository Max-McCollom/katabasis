export class AccessError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'AccessError'
    this.code = code
  }
}

const requestFields = 'user_id,status,display_name,contact_phone'
const materialFields = 'id,title,summary,file_type'
const reviewStates = new Set(['pending', 'approved', 'rejected', 'revoked'])

// A recovery URL is a navigation hint, never proof of a recovery session.
export function recoveryAuthorization(previous, event, session) {
  if (['SIGNED_OUT', 'RECOVERY_COMPLETED', 'RECOVERY_CANCELLED'].includes(event) || !session?.access_token || !session?.user?.id) return null
  if (event === 'PASSWORD_RECOVERY') return { userId: session.user.id, accessToken: session.access_token }
  if (!previous || previous.userId !== session.user.id) return null
  if (event === 'TOKEN_REFRESHED') return { ...previous, accessToken: session.access_token }
  return previous.accessToken === session.access_token ? previous : null
}

export function canResetPassword(session, authorization) {
  return Boolean(authorization && session?.user?.id === authorization.userId && session?.access_token === authorization.accessToken)
}

export async function resetRecoveryPassword(client, session, authorization, password) {
  const denied = () => new AccessError('invalid_recovery', 'Request a new password reset link to continue.')
  if (!canResetPassword(session, authorization)) throw denied()
  const current = await client.auth.getSession()
  if (current.error || !canResetPassword(current.data?.session, authorization)) throw denied()
  const identity = await client.auth.getUser()
  if (identity.error || identity.data?.user?.id !== authorization.userId) throw denied()
  const result = await client.auth.updateUser({ password })
  if (result.error) throw result.error
  return result.data
}

export async function submitResearchRequest(client, displayName, phone) {
  const { error } = await client.rpc('submit_research_access_request', {
    p_display_name: displayName?.trim().slice(0, 100) || null,
    p_contact_phone: phone?.trim().slice(0, 40) || null,
  })
  if (error) throw new AccessError('request_failed', 'Your request could not be saved. Please try again.')
}

export async function loadResearchAccess(client, signal) {
  const { data: { user } = {}, error: userError } = await client.auth.getUser()
  if (userError || !user) throw new AccessError('session_expired', 'Please sign in again to review your access.')
  if (!user.email_confirmed_at) return { kind: 'unconfirmed', user, materials: [] }

  const readRequest = () => client.from('research_access_requests')
    .select(requestFields).eq('user_id', user.id).abortSignal(signal).maybeSingle()
  let { data: request, error } = await readRequest()
  if (error) throw new AccessError('review_unavailable', 'Access status is unavailable. Please try again.')

  // Metadata is self-reported contact information, never authorization.
  // Only a signup explicitly requesting research access is submitted here.
  if (!request && user.user_metadata?.research_access_requested === true) {
    await submitResearchRequest(client, user.user_metadata.display_name || user.email, user.user_metadata.contact_phone)
    const result = await readRequest()
    request = result.data
    error = result.error
    if (error || !request) throw new AccessError('review_unavailable', 'Your request status is not available yet. Please try again.')
  }
  if (!request) return { kind: 'request', user, materials: [] }
  if (!reviewStates.has(request.status)) throw new AccessError('review_unavailable', 'Access status is unavailable. Please try again.')
  if (request.status !== 'approved') return { kind: request.status, user, request, materials: [] }

  // RLS returns only individually granted materials. Storage paths are not requested.
  const result = await client.from('research_materials').select(materialFields)
    .order('title', { ascending: true }).abortSignal(signal)
  if (result.error) throw new AccessError('catalog_unavailable', 'Shared research could not be loaded. Please try again.')
  const materials = [...(result.data || [])].sort((left, right) =>
    (left.file_type === 'application/pdf' ? 0 : 1) - (right.file_type === 'application/pdf' ? 0 : 1))
  return { kind: 'approved', user, request, materials }
}

export async function downloadResearchMaterial(client, configuration, materialId, signal, fetcher = fetch) {
  if (!configuration || typeof materialId !== 'string' || !materialId || materialId.length > 128) throw new AccessError('unavailable', 'This download is unavailable.')
  const { data: { session } = {}, error } = await client.auth.getSession()
  if (error || !session?.access_token) throw new AccessError('session_expired', 'Please sign in again before downloading.')
  const response = await fetcher(configuration.downloadUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + session.access_token,
      apikey: configuration.publishableKey,
      'Content-Type': 'application/json',
      Accept: 'application/octet-stream',
    },
    body: JSON.stringify({ material_id: materialId }),
    cache: 'no-store',
    credentials: 'omit',
    signal,
  })
  if (!response.ok) {
    if (response.status === 401) throw new AccessError('session_expired', 'Your session has expired. Please sign in again.')
    if ([403, 404].includes(response.status)) throw new AccessError('access_changed', 'This material is not available to your account. Refresh your access to continue.')
    throw new AccessError('download_failed', 'The download could not be completed. Please try again.')
  }
  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') || ''
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const plain = disposition.match(/filename="?([^";]+)"?/i)?.[1]
  let filename = plain || 'research-material'
  if (encoded) { try { filename = decodeURIComponent(encoded) } catch { /* Use safe fallback. */ } }
  filename = filename.replace(/[\u0000-\u001f<>:"/\\|?*]/g, '_').slice(0, 180) || 'research-material'
  return { blob, filename }
}

export function authMessage(error, fallback = 'That request could not be completed. Please try again.') {
  const messages = {
    invalid_credentials: 'The email or password was not accepted. Please try again.',
    email_not_confirmed: 'Confirm your email before signing in. You can request another confirmation below.',
    weak_password: 'Choose a stronger password that meets the account requirements.',
    same_password: 'Choose a password different from your current password.',
    over_email_send_rate_limit: 'Please wait before requesting another email.',
    over_request_rate_limit: 'Too many attempts. Please wait and try again.',
    session_not_found: 'This session has expired. Request a new password reset link.',
  }
  if (error instanceof AccessError) return error.message
  return messages[error?.code] || fallback
}
