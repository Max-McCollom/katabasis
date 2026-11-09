/*
 * Research access client. Provider configuration and server policies are required.
 * Browser variables: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY only.
 * Request: own-only research_access_requests(user_id,status,display_name,contact_phone).
 * States: pending / approved / rejected / revoked; unknown states fail closed.
 * RPC: submit_research_access_request(p_display_name,p_contact_phone).
 * Catalog: research_materials(id,title,summary,file_type), filtered by server RLS.
 * Per-material grants and confirmed email are enforced by the backend.
 * Downloads: POST research-download {material_id}; current session JWT + publishable key.
 * The server derives the private Storage path and returns no-store file bytes.
 * No private files, paths, grant decisions, service keys or signed URLs are bundled.
 * Phone is optional contact information; it is never an auth/SMS identifier.
 * Host renders its existing header/footer around this content component.
 * Reviewer authority and every file permission are verified by the server.
 * Local fixtures alone are not proof of live provider or permission acceptance.
 */
import { useEffect, useId, useRef, useState } from 'react'
import { accessReturnUrl, getAuthClient, readAuthConfiguration } from './authClient.js'
import { authMessage, canResetPassword, downloadResearchMaterial, loadResearchAccess, recoveryAuthorization, resetRecoveryPassword, submitResearchRequest } from './researchAccess.js'
import ReviewerPanel from './ReviewerPanel.jsx'
import './access.css'

function initialMode() {
  if (typeof window === 'undefined') return 'signin'
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.slice(1))
  return query.get('access') === 'recovery' || hash.get('type') === 'recovery' ? 'reset' : 'signin'
}

function Field({ id, label, hint, ...props }) {
  return <div className="access-field"><label htmlFor={id}>{label}</label><input id={id} aria-describedby={hint ? id + '-hint' : undefined} {...props} />{hint && <p className="access-hint" id={id + '-hint'}>{hint}</p>}</div>
}

function Notice({ error, message }) {
  return <>{error && <p className="access-notice access-error" role="alert">{error}</p>}{message && <p className="access-notice" role="status">{message}</p>}</>
}

export default function PrivateAccess({ returnPath = '/research-access/', children }) {
  const [client] = useState(() => getAuthClient())
  const [configuration] = useState(() => readAuthConfiguration())
  const [mode, setMode] = useState(initialMode)
  const [session, setSession] = useState(null)
  const [recovery, setRecovery] = useState(null)
  const recoveryRef = useRef(null)
  const [authLoading, setAuthLoading] = useState(Boolean(client))
  const [view, setView] = useState({ kind: 'loading', materials: [] })
  const [refresh, setRefresh] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [downloading, setDownloading] = useState(null)
  const downloadController = useRef(null)
  const downloadUrls = useRef(new Set())
  const id = 'research-access-' + useId().replaceAll(':', '')
  const currentUser = useRef(null)
  currentUser.current = session?.user?.id || null

  function clearRecovery(event = 'RECOVERY_CANCELLED') {
    recoveryRef.current = recoveryAuthorization(recoveryRef.current, event, null)
    setRecovery(recoveryRef.current)
  }

  function clearDownloads() {
    downloadController.current?.abort()
    downloadController.current = null
    for (const url of downloadUrls.current) URL.revokeObjectURL(url)
    downloadUrls.current.clear()
    setDownloading(null)
  }

  useEffect(() => {
    if (!client) return
    let active = true
    let authRevision = 0
    // Keep this callback synchronous; data work runs in the separate effect.
    const { data: { subscription } } = client.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return
      authRevision += 1
      recoveryRef.current = recoveryAuthorization(recoveryRef.current, event, nextSession)
      setRecovery(recoveryRef.current)
      if (currentUser.current !== (nextSession?.user?.id || null)) clearDownloads()
      currentUser.current = nextSession?.user?.id || null
      if (event === 'PASSWORD_RECOVERY') setMode('reset')
      if (event === 'SIGNED_OUT') {
        clearDownloads()
        setView({ kind: 'loading', materials: [] })
        setPassword('')
        setConfirmation('')
      }
      setSession(nextSession)
      setAuthLoading(false)
    })
    const initialRevision = authRevision
    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active || authRevision !== initialRevision) return
      setSession(data?.session || null)
      setAuthLoading(false)
      if (sessionError) setError('Your session could not be restored. Please sign in again.')
    }).catch(() => {
      if (active && authRevision === initialRevision) { setAuthLoading(false); setError('Your session could not be restored. Please sign in again.') }
    })
    return () => { active = false; subscription.unsubscribe(); downloadController.current?.abort() }
  }, [client])

  useEffect(() => {
    if (!client || !session?.user || mode === 'reset') return
    const controller = new AbortController()
    let active = true
    setView({ kind: 'loading', materials: [] })
    loadResearchAccess(client, controller.signal).then(next => {
      if (!active) return
      setView(next)
      setDisplayName(next.request?.display_name || next.user?.user_metadata?.display_name || '')
      setPhone(next.request?.contact_phone || next.user?.user_metadata?.contact_phone || '')
    }).catch(failure => {
      if (active && failure.name !== 'AbortError') setView({ kind: 'error', materials: [], message: authMessage(failure) })
    })
    return () => { active = false; controller.abort() }
  }, [client, session?.access_token, mode, refresh])

  useEffect(() => {
    if (!session) return
    const onFocus = () => { if (document.visibilityState === 'visible') setRefresh(value => value + 1) }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [Boolean(session)])

  useEffect(() => () => {
    for (const url of downloadUrls.current) URL.revokeObjectURL(url)
    downloadUrls.current.clear()
  }, [])

  function changeMode(next) {
    if (next !== 'reset') clearRecovery()
    if (next === 'forgot' && session?.user?.email) setEmail(session.user.email)
    setMode(next)
    setPassword('')
    setConfirmation('')
    setError('')
    setMessage('')
  }

  async function run(action) {
    if (busy) return
    setBusy(true)
    setError('')
    setMessage('')
    try { await action() }
    catch (failure) { setError(authMessage(failure)) }
    finally { setBusy(false) }
  }

  function authSubmit(event) {
    event.preventDefault()
    if (!client) return
    run(async () => {
      const address = email.trim()
      if (mode === 'forgot') {
        const result = await client.auth.resetPasswordForEmail(address, { redirectTo: accessReturnUrl(returnPath, true) })
        if (result.error) throw result.error
        setMessage('If an account uses that email, a password reset link will arrive shortly.')
        return
      }
      if (mode === 'signup') {
        if (password !== confirmation) { setError('The passwords do not match.'); return }
        const result = await client.auth.signUp({
          email: address,
          password,
          options: {
            emailRedirectTo: accessReturnUrl(returnPath),
            data: { display_name: displayName.trim() || null, contact_phone: phone.trim() || null, research_access_requested: true },
          },
        })
        if (result.error) throw result.error
        setPassword('')
        setConfirmation('')
        setMessage('Check your email to confirm your account. After confirmation, your research access request will be reviewed.')
        setMode('signin')
        if (result.data?.session) setSession(result.data.session)
        return
      }
      const result = await client.auth.signInWithPassword({ email: address, password })
      if (result.error) throw result.error
      setPassword('')
      setSession(result.data.session)
    })
  }

  function resetSubmit(event) {
    event.preventDefault()
    if (!client || !canResetPassword(session, recoveryRef.current)) {
      clearRecovery()
      setError('Request a new password reset link to continue.')
      return
    }
    run(async () => {
      if (password !== confirmation) { setError('The passwords do not match.'); return }
      try { await resetRecoveryPassword(client, session, recoveryRef.current, password) }
      catch (failure) { if (failure.code === 'invalid_recovery') clearRecovery(); throw failure }
      clearRecovery('RECOVERY_COMPLETED')
      setPassword('')
      setConfirmation('')
      window.history.replaceState(window.history.state, '', new URL(returnPath, window.location.origin).pathname)
      setMode('signin')
      setMessage('Your password has been updated.')
      setRefresh(value => value + 1)
    })
  }

  async function resendConfirmation() {
    if (!client || !(session?.user?.email || email.trim())) { setError('Enter your email first.'); return }
    run(async () => {
      const result = await client.auth.resend({ type: 'signup', email: session?.user?.email || email.trim(), options: { emailRedirectTo: accessReturnUrl(returnPath) } })
      if (result.error) throw result.error
      setMessage('If confirmation is still required, a new email will arrive shortly.')
    })
  }

  async function logout() {
    if (!client) return
    clearRecovery('SIGNED_OUT')
    clearDownloads()
    setView({ kind: 'loading', materials: [] })
    await run(async () => {
      const result = await client.auth.signOut({ scope: 'local' })
      if (result.error) {
        setView({ kind: 'error', materials: [], message: 'Sign-out could not be completed. Try signing out again.' })
        throw result.error
      }
      setSession(null)
      changeMode('signin')
      setMessage('You have signed out on this device.')
    })
  }

  function requestSubmit(event) {
    event.preventDefault()
    run(async () => {
      await submitResearchRequest(client, displayName || session.user.email, phone)
      setMessage('Your request has been submitted for review.')
      setRefresh(value => value + 1)
    })
  }

  async function download(material) {
    if (downloading || view.kind !== 'approved') return
    const userId = session?.user?.id
    setDownloading(material.id)
    setError('')
    setMessage('')
    const controller = new AbortController()
    downloadController.current = controller
    try {
      const latest = await loadResearchAccess(client, controller.signal)
      if (latest.user.id !== userId || latest.kind !== 'approved' || !latest.materials.some(item => item.id === material.id)) {
        setView(latest)
        throw new Error('Material access changed.')
      }
      const { blob, filename } = await downloadResearchMaterial(client, configuration, material.id, controller.signal)
      if (controller.signal.aborted || currentUser.current !== userId) return
      const url = URL.createObjectURL(blob)
      downloadUrls.current.add(url)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => { URL.revokeObjectURL(url); downloadUrls.current.delete(url) }, 30_000)
      setMessage('Your download is ready.')
    } catch (failure) {
      if (failure.name !== 'AbortError') { setError(authMessage(failure, 'The download is unavailable. Refresh your access and try again.')); setRefresh(value => value + 1) }
    } finally {
      if (downloadController.current === controller) downloadController.current = null
      setDownloading(null)
    }
  }

  const contactFields = <><Field id={id + '-name'} label="Name (optional)" name="name" autoComplete="name" maxLength={100} value={displayName} onChange={event => setDisplayName(event.target.value)} /><Field id={id + '-phone'} label="Phone (optional)" type="tel" name="phone" autoComplete="tel" maxLength={40} value={phone} onChange={event => setPhone(event.target.value)} hint="Contact information only. Phone is not used for sign-in or SMS verification." /></>
  const passwordFields = <><Field id={id + '-password'} label={mode === 'reset' ? 'New password' : 'Password'} type="password" name="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required minLength={mode === 'signin' ? undefined : 12} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} hint={mode === 'signin' ? undefined : 'Use at least 12 characters.'} />{['signup', 'reset'].includes(mode) && <Field id={id + '-confirm'} label="Confirm password" type="password" name="password_confirmation" autoComplete="new-password" required minLength={12} maxLength={128} value={confirmation} onChange={event => setConfirmation(event.target.value)} />}</>

  let content
  if (!client || !configuration) {
    content = <div className="access-panel"><h2>Research access is not open yet</h2><p>The account service is not configured. No account details are collected here.</p><a href="/work/">Explore the public research</a></div>
  } else if (authLoading) {
    content = <div className="access-panel" role="status"><h2>Checking your session</h2><p>Research access will appear after your account is checked.</p></div>
  } else if (mode === 'reset') {
    content = <RecoveryPanel authorized={canResetPassword(session, recovery)} busy={busy} passwordFields={passwordFields} onSubmit={resetSubmit} onLogout={logout} onRequestReset={() => changeMode('forgot')} hasSession={Boolean(session)} />
  } else if (!session || mode === 'forgot') {
    content = <div className="access-panel"><nav className="access-modes" aria-label="Account actions"><button type="button" aria-pressed={mode === 'signin'} onClick={() => changeMode('signin')} disabled={busy}>Sign in</button><button type="button" aria-pressed={mode === 'signup'} onClick={() => changeMode('signup')} disabled={busy}>Create account</button></nav><h2>{mode === 'signup' ? 'Create an account' : mode === 'forgot' ? 'Reset your password' : 'Sign in'}</h2><p>{mode === 'signup' ? 'Confirm your email, then await owner approval. An account alone does not grant access to private research.' : mode === 'forgot' ? 'Request a link to choose a new password.' : 'Sign in to review your request or open research shared with you.'}</p><form onSubmit={authSubmit}><fieldset disabled={busy}>{mode === 'signup' && contactFields}<Field id={id + '-email'} label="Email" type="email" name="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />{mode !== 'forgot' && passwordFields}<button type="submit">{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Sign in'}</button></fieldset></form>{mode === 'signin' && <div className="access-secondary-actions"><button className="access-text-button" type="button" onClick={() => changeMode('forgot')} disabled={busy}>Forgot password?</button><button className="access-text-button" type="button" onClick={resendConfirmation} disabled={busy}>Resend confirmation</button></div>}</div>
  } else {
    content = <div className="access-signed-in"><div className="access-account"><p>Signed in as <strong>{session.user.email}</strong></p><button type="button" className="access-secondary" onClick={logout} disabled={busy}>Sign out</button></div><AccessState view={view} busy={busy} downloading={downloading} onRefresh={() => setRefresh(value => value + 1)} onDownload={download} onResend={resendConfirmation} requestForm={<form onSubmit={requestSubmit}><fieldset disabled={busy}>{contactFields}<button type="submit">{busy ? 'Submitting…' : 'Request research access'}</button></fieldset></form>} /><ReviewerPanel key={session.user.id} client={client} userId={session.user.id} sessionToken={session.access_token} revision={refresh} /></div>
  }

  return <section className="research-access" aria-labelledby={id + '-title'}><header className="access-heading"><p className="access-eyebrow">Private research</p><h1 id={id + '-title'}>Research access</h1><p>Accounts are reviewed individually. Approved readers can open the materials shared with them.</p></header><Notice error={error} message={message} />{content}{children && <div className="access-context">{children}</div>}</section>
}

export function RecoveryPanel({ authorized, busy, passwordFields, onSubmit, onLogout, onRequestReset, hasSession }) {
  if (!authorized) return <div className="access-panel"><h2>Request a new reset link</h2><p>The reset session is unavailable or has expired. A recovery link is required even if an account is already signed in.</p><button type="button" onClick={onRequestReset}>Request password reset</button>{hasSession && <button className="access-text-button" type="button" onClick={onLogout} disabled={busy}>Sign out</button>}</div>
  return <div className="access-panel"><h2>Set a new password</h2><form onSubmit={onSubmit}><fieldset disabled={busy}>{passwordFields}<button type="submit">{busy ? 'Saving password…' : 'Save password'}</button></fieldset></form><button className="access-text-button" type="button" onClick={onLogout} disabled={busy}>Sign out instead</button></div>
}

export function AccessState({ view, busy, downloading, onRefresh, onDownload, onResend, requestForm }) {
  if (view.kind === 'loading') return <div className="access-panel" role="status"><h2>Checking your access</h2><p>Loading your request and shared materials.</p></div>
  if (view.kind === 'error') return <div className="access-panel"><h2>Access could not be loaded</h2><p role="alert">{view.message}</p><button type="button" onClick={onRefresh}>Try again</button></div>
  if (view.kind === 'unconfirmed') return <div className="access-panel"><h2>Confirm your email</h2><p>Open the confirmation email before your access request can be reviewed.</p><button type="button" onClick={onResend} disabled={busy}>Resend confirmation</button></div>
  if (view.kind === 'request') return <div className="access-panel"><h2>Request research access</h2><p>Your email is confirmed. Submit a request for owner review.</p>{requestForm}</div>
  if (view.kind === 'pending') return <div className="access-panel"><p className="access-state-label">Pending review</p><h2>Your request is awaiting approval</h2><p>Your email is confirmed. The project owner will review your request before sharing private materials.</p><button type="button" onClick={onRefresh} disabled={busy}>Check request status</button></div>
  if (['rejected', 'revoked'].includes(view.kind)) return <div className="access-panel"><h2>Research access is not available</h2><p>{view.kind === 'revoked' ? 'Your access is no longer active.' : 'Your request has not been approved.'} Public research remains available.</p><a href="/work/">View public research</a><button className="access-text-button" type="button" onClick={onRefresh} disabled={busy}>Check status</button></div>
  if (view.kind !== 'approved') return <div className="access-panel"><h2>Access status is unavailable</h2><p>Private research cannot be opened while your status is unresolved.</p><button type="button" onClick={onRefresh}>Try again</button></div>
  return <section className="access-catalog" aria-labelledby="access-materials-title"><div className="access-catalog-heading"><div><p className="access-state-label">Approved access</p><h2 id="access-materials-title">Shared research</h2></div><button className="access-text-button" type="button" onClick={onRefresh} disabled={Boolean(downloading)}>Refresh materials</button></div>{view.materials.length === 0 ? <p className="access-empty">Your account is approved. No materials have been shared with you yet.</p> : <ul className="access-materials">{view.materials.map(material => <li key={material.id}><div><p className="access-file-type">{{ 'application/pdf': 'PDF report', 'text/csv': 'CSV data', 'text/plain': 'Text document', 'text/markdown': 'Research note', 'image/png': 'Research figure', 'image/jpeg': 'Research figure' }[material.file_type] || 'Research file'}</p><h3>{material.title}</h3>{material.summary && <p>{material.summary}</p>}</div><button type="button" onClick={() => onDownload(material)} disabled={Boolean(downloading)} aria-label={'Download ' + material.title}>{downloading === material.id ? 'Preparing download…' : 'Download'}</button></li>)}</ul>}</section>
}
