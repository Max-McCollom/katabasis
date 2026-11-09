import { useEffect, useId, useState } from 'react'
import { authMessage } from './researchAccess.js'
import { loadResearchReviewer, reviewResearchAccess } from './reviewerAccess.js'

export default function ReviewerPanel({ client, userId, sessionToken, revision = 0 }) {
  const [view, setView] = useState({ kind: 'loading' })
  const [refresh, setRefresh] = useState(0)
  const [filter, setFilter] = useState('pending')
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    setView({ kind: 'loading' })
    loadResearchReviewer(client, controller.signal).then(next => {
      if (active) setView(next)
    }).catch(failure => {
      if (active && failure.name !== 'AbortError') setView(failure.reviewerVerified ? { kind: 'error', message: authMessage(failure) } : { kind: 'not-reviewer' })
    })
    return () => { active = false; controller.abort() }
  }, [client, userId, sessionToken, revision, refresh])

  async function save(request, status, materials) {
    if (busy || view.kind !== 'reviewer') return
    setBusy(request.user_id)
    setError('')
    setMessage('')
    try {
      await reviewResearchAccess(client, request.user_id, status, materials)
      // The UI never assumes success locally: reload server decisions and grants.
      const next = await loadResearchReviewer(client)
      setView(next)
      if (next.kind === 'reviewer') setMessage(status === 'approved' ? 'Approval saved. Only the selected materials are shared.' : status === 'revoked' ? 'Access revoked.' : 'Request declined.')
    } catch (failure) {
      if (failure.code === 'reviewer_denied') setView({ kind: 'not-reviewer' })
      else setError(authMessage(failure))
    } finally { setBusy(null) }
  }

  if (view.kind === 'error') return <section className="access-review"><h2>Owner review</h2><p className="access-notice access-error" role="alert">{view.message}</p><button type="button" className="access-secondary" onClick={() => setRefresh(value => value + 1)}>Reload requests</button></section>
  if (view.kind !== 'reviewer') return null
  const pending = view.requests.filter(request => request.status === 'pending').length
  const requests = filter === 'pending' ? view.requests.filter(request => request.status === 'pending') : view.requests
  return <section className="access-review" aria-labelledby="access-review-title"><div className="access-catalog-heading"><div><p className="access-state-label">Owner review</p><h2 id="access-review-title">Access requests</h2></div><button type="button" className="access-secondary" onClick={() => setRefresh(value => value + 1)} disabled={Boolean(busy)}>Refresh requests</button></div><p>Review each reader and choose the research they may download. Account approval and file access are separate decisions.</p>{error && <p className="access-notice access-error" role="alert">{error}</p>}{message && <p className="access-notice" role="status">{message}</p>}<div className="access-review-filters" aria-label="Request filter"><button type="button" className="access-secondary" aria-pressed={filter === 'pending'} onClick={() => setFilter('pending')} disabled={Boolean(busy)}>Pending ({pending})</button><button type="button" className="access-secondary" aria-pressed={filter === 'all'} onClick={() => setFilter('all')} disabled={Boolean(busy)}>All requests ({view.requests.length})</button></div>{requests.length === 0 ? <p className="access-empty">{filter === 'pending' ? 'No requests are waiting for review.' : 'No access requests have been submitted.'}</p> : <div className="access-review-list">{requests.map(request => <ReviewRequest key={request.user_id + ':' + request.updated_at + ':' + (request.material_ids || []).join(',')} request={request} materials={view.materials} busy={Boolean(busy)} saving={busy === request.user_id} onSave={save} />)}</div>}</section>
}

export function ReviewRequest({ request, materials, busy, saving, onSave }) {
  const id = 'review-' + useId().replaceAll(':', '')
  const [selected, setSelected] = useState(() => (request.material_ids || []).filter(materialId => materials.some(item => item.id === materialId)))
  const confirmed = request.email_confirmed === true
  function toggle(materialId, checked) { setSelected(current => checked ? [...new Set([...current, materialId])] : current.filter(id => id !== materialId)) }
  function submit(event) { event.preventDefault(); if (confirmed && !busy) onSave(request, 'approved', selected) }
  return <article className="access-review-request"><header><div><h3>{request.display_name || request.email || 'Reader request'}</h3>{request.display_name && <p>{request.email}</p>}</div><p className="access-review-status">{request.status}</p></header>{request.contact_phone && <p className="access-review-contact">Contact phone: {request.contact_phone}</p>}{!confirmed && <p className="access-notice">Email confirmation is required before approval.</p>}<form onSubmit={submit}><fieldset disabled={busy || !confirmed}><legend>Research to share</legend>{materials.length ? <div className="access-grant-options">{materials.map(material => <label key={material.id} htmlFor={id + '-' + material.id}><input id={id + '-' + material.id} type="checkbox" checked={selected.includes(material.id)} onChange={event => toggle(material.id, event.target.checked)} /><span><strong>{material.title}</strong>{material.summary && <span>{material.summary}</span>}</span></label>)}</div> : <p className="access-hint">No published files are available yet. You can approve the account now and share files after they are uploaded.</p>}<p className="access-hint">Saving approval replaces any previous file selection. {selected.length ? `${selected.length} ${selected.length === 1 ? 'file' : 'files'} selected.` : 'No files selected: the account will have no private file access.'}</p><button type="submit">{saving ? 'Saving decision…' : request.status === 'approved' ? selected.length ? 'Save shared research' : 'Save approval without files' : selected.length ? 'Approve selected research' : 'Approve without files'}</button></fieldset></form><div className="access-secondary-actions">{request.status !== 'approved' && request.status !== 'revoked' && <button type="button" className="access-text-button" onClick={() => onSave(request, 'rejected', [])} disabled={busy}>Decline request</button>}{request.status === 'approved' && <button type="button" className="access-text-button" onClick={() => onSave(request, 'revoked', [])} disabled={busy}>Revoke access</button>}</div></article>
}
