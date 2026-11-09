import { AccessError } from './researchAccess.js'

const statuses = new Set(['approved', 'rejected', 'revoked'])
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const withSignal = (request, signal) => signal && request.abortSignal ? request.abortSignal(signal) : request

function reviewError(error) {
  if (error?.code === '42501') return new AccessError('reviewer_denied', 'Owner review is unavailable for this account. Refresh your session to continue.')
  if (error?.code === '22023') return new AccessError('review_selection_changed', 'The available research changed. Refresh the review list and select the materials again.')
  if (error?.code === 'P0002') return new AccessError('review_request_changed', 'This request is no longer available. Refresh the review list.')
  return new AccessError('reviewer_unavailable', 'The review list could not be updated. Please try again.')
}

// The server verifies the confirmed Auth UUID against its private reviewer list.
// Contact metadata, email strings and a visible interface never confer authority.
export async function loadResearchReviewer(client, signal) {
  const identity = await client.auth.getUser()
  if (identity.error || !identity.data?.user?.email_confirmed_at) return { kind: 'not-reviewer' }
  const permission = await withSignal(client.rpc('research_is_reviewer'), signal)
  if (permission.error) {
    if (permission.error.code === '42501') return { kind: 'not-reviewer' }
    throw reviewError(permission.error)
  }
  if (permission.data !== true) return { kind: 'not-reviewer' }
  try {
    const [requests, materials] = await Promise.all([
      withSignal(client.rpc('list_research_access_requests'), signal),
      withSignal(client.rpc('list_research_review_materials'), signal),
    ])
    if (requests.error || materials.error) throw reviewError(requests.error || materials.error)
    if (!Array.isArray(requests.data) || !Array.isArray(materials.data)) throw reviewError()
    return { kind: 'reviewer', requests: requests.data, materials: materials.data }
  } catch (failure) {
    if (failure.name === 'AbortError' || failure.code === 'reviewer_denied') throw failure
    const error = reviewError()
    // A safe retry notice may be shown only after the server role check passed.
    error.reviewerVerified = true
    throw error
  }
}

export async function reviewResearchAccess(client, userId, status, materialIds = []) {
  if (!uuid.test(userId) || !statuses.has(status) || !Array.isArray(materialIds) || materialIds.some(id => typeof id !== 'string' || !uuid.test(id))) {
    throw new AccessError('invalid_review', 'Refresh the review list before saving this decision.')
  }
  const result = await client.rpc('review_research_access', {
    p_user_id: userId,
    p_status: status,
    // Approval replaces the grant set; declining/revoking always grants nothing.
    p_material_ids: status === 'approved' ? [...new Set(materialIds)] : [],
  })
  if (result.error) throw reviewError(result.error)
}
