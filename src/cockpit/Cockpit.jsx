import { useEffect, useMemo, useState } from 'react'
import './cockpit.css'

const TELEMETRY_URL = '/telemetry/demo_cockpit_snapshot.json'
const ROUTE_CLASS = 'katabasis-cockpit-route'

function useCockpitRouteClass() {
  useEffect(() => {
    document.documentElement.classList.add(ROUTE_CLASS)
    document.body.classList.add(ROUTE_CLASS)

    return () => {
      document.documentElement.classList.remove(ROUTE_CLASS)
      document.body.classList.remove(ROUTE_CLASS)
    }
  }, [])
}

function useSnapshot() {
  const [snapshot, setSnapshot] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadSnapshot() {
      try {
        const response = await fetch(TELEMETRY_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`Telemetry fixture returned ${response.status}`)
        const data = await response.json()
        if (!cancelled) {
          setSnapshot(data)
          setError('')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load public telemetry fixture.')
        }
      }
    }

    loadSnapshot()

    return () => {
      cancelled = true
    }
  }, [])

  return { snapshot, error }
}

function formatDate(value) {
  if (!value) return 'Not declared'
  return value.replace('T', ' ').replace('Z', ' UTC')
}

function ShellVisual() {
  return (
    <div className="kc-shell-visual" aria-label="Layered public shell and private depth illustration">
      <div className="kc-shell-visual__mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="kc-shell-visual__plane kc-shell-visual__plane--surface">
        <span>Public shell</span>
        <i />
      </div>
      <div className="kc-shell-visual__plane kc-shell-visual__plane--boundary">
        <span>Selective export</span>
        <i />
      </div>
      <div className="kc-shell-visual__plane kc-shell-visual__plane--depth">
        <span>Private depth</span>
        <i />
      </div>
      <div className="kc-shell-visual__thread kc-shell-visual__thread--one" />
      <div className="kc-shell-visual__thread kc-shell-visual__thread--two" />
    </div>
  )
}

function Hero({ snapshot }) {
  return (
    <section className="kc-hero" id="overview">
      <div className="kc-hero__copy">
        <p className="kc-kicker">Public shell / private depth</p>
        <h1>A public shell for a private quantitative system.</h1>
        <p>
          Katabasis is a systems-driven research environment. The public site presents a simplified
          surface; the private environment contains the deeper operational view.
        </p>
        <div className="kc-hero__actions">
          <a href="#public-private">Explore the public surface</a>
          <a href="#private-environment">Private environment</a>
        </div>
      </div>
      <div className="kc-hero__visual">
        <ShellVisual />
        <div className="kc-hero__contract" aria-label="Public contract summary">
          <span>{snapshot?.mode ?? 'PUBLIC_DEMO'}</span>
          <span>{snapshot?.provenance ?? 'DEMO_SYNTHETIC'}</span>
        </div>
      </div>
    </section>
  )
}

function WhatKatabasisIs() {
  const blocks = [
    {
      title: 'Research',
      copy: 'A quantitative research environment for studying structured market systems and model behavior.',
    },
    {
      title: 'Observability',
      copy: 'A design focus on making process boundaries, state, and public contracts legible.',
    },
    {
      title: 'Control',
      copy: 'A private operating layer is where deeper process visibility and management belong.',
    },
  ]

  return (
    <section className="kc-overview" aria-labelledby="overview-title">
      <div className="kc-section-heading">
        <p className="kc-kicker">What Katabasis is</p>
        <h2 id="overview-title">A simplified public mental model for a deeper system.</h2>
      </div>
      <div className="kc-overview__grid">
        {blocks.map((block, index) => (
          <article className="kc-overview__item" key={block.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{block.title}</h3>
            <p>{block.copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function PublicPrivate() {
  return (
    <section className="kc-public-private" id="public-private" aria-labelledby="public-private-title">
      <div className="kc-section-heading">
        <p className="kc-kicker">Public / Private</p>
        <h2 id="public-private-title">The public surface is intentionally selective.</h2>
        <p>
          The private environment is where internal state, process flow, and deeper system control
          belong.
        </p>
      </div>
      <div className="kc-layer-stack" aria-label="Public and private layer model">
        <div className="kc-layer kc-layer--public">
          <div>
            <span>Public shell</span>
            <strong>Simplified, selective, narrative, public artifacts.</strong>
          </div>
        </div>
        <div className="kc-layer kc-layer--boundary">
          <div>
            <span>Boundary</span>
            <strong>Static export, synthetic fixture, public/private separation.</strong>
          </div>
        </div>
        <div className="kc-layer kc-layer--private">
          <div>
            <span>Private depth</span>
            <strong>Process state, decision pathways, internal telemetry, research management.</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

function SystemPillars() {
  const pillars = [
    ['Research', 'Structured inquiry, experiments, and model behavior stay organized over time.'],
    ['Observability', 'System boundaries and state transitions are designed to be inspectable.'],
    ['Control', 'The deeper operating layer is built for management, gating, and attention.'],
    ['Evolution', 'The public surface records project movement without exposing private depth.'],
  ]

  return (
    <section className="kc-pillars" aria-labelledby="pillars-title">
      <div className="kc-section-heading">
        <p className="kc-kicker">System pillars</p>
        <h2 id="pillars-title">Four concepts, kept deliberately simple in public.</h2>
      </div>
      <div className="kc-pillars__grid">
        {pillars.map(([title, copy]) => (
          <article className="kc-pillar" key={title}>
            <div className="kc-pillar__glyph" aria-hidden="true">
              <span />
              <span />
            </div>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Artifacts({ snapshot, error }) {
  const artifacts = useMemo(
    () => [
      {
        title: 'Public contract',
        label: snapshot?.mode ?? 'PUBLIC_DEMO',
        copy: 'A small static contract identifies this surface as public demonstration material.',
      },
      {
        title: 'Synthetic fixture',
        label: snapshot?.provenance ?? 'DEMO_SYNTHETIC',
        copy: 'The fixture exercises structure and labeling without exposing private system content.',
      },
      {
        title: 'Schema version',
        label: snapshot?.schema_version ?? '0.1.0',
        copy: 'The page consumes declared fixture metadata rather than hardcoding the contract story.',
      },
      {
        title: 'Archive',
        label: '/estate',
        copy: 'Historical visual R&D remains accessible as an archive, not the current product surface.',
      },
    ],
    [snapshot],
  )

  return (
    <section className="kc-artifacts" id="artifacts" aria-labelledby="artifacts-title">
      <div className="kc-section-heading">
        <p className="kc-kicker">Selected public artifacts</p>
        <h2 id="artifacts-title">Proof of a real public layer, curated down to safe signals.</h2>
        {error && <p className="kc-error">{error}</p>}
      </div>
      <div className="kc-artifacts__grid">
        {artifacts.map((artifact) => (
          <article className="kc-artifact" key={artifact.title}>
            <span>{artifact.title}</span>
            <strong>{artifact.label}</strong>
            <p>{artifact.copy}</p>
          </article>
        ))}
      </div>
      <p className="kc-artifacts__note">
        Fixture label: {snapshot?.label ?? 'DEMO_SYNTHETIC public cockpit snapshot'} · Generated:{' '}
        {formatDate(snapshot?.generated_at)}
      </p>
    </section>
  )
}

function PrivateGateway() {
  return (
    <section className="kc-private" id="private-environment" aria-labelledby="private-title">
      <div className="kc-private__copy">
        <p className="kc-kicker">Private environment</p>
        <h2 id="private-title">The deeper operating layer belongs behind the public shell.</h2>
        <p>
          The private environment is designed for deeper operational visibility: process state,
          decision pathways, telemetry, and research management. This public page only describes that
          separation.
        </p>
        <a href="#private-environment" aria-label="Private layer is not public">
          Private layer not public
        </a>
      </div>
      <div className="kc-private__visual" aria-label="Abstract private environment preview">
        <div className="kc-private__pane kc-private__pane--one" />
        <div className="kc-private__pane kc-private__pane--two" />
        <div className="kc-private__pane kc-private__pane--three" />
        <span />
        <span />
        <span />
      </div>
    </section>
  )
}

function Evolution() {
  return (
    <section className="kc-evolution" id="archive" aria-labelledby="archive-title">
      <div>
        <p className="kc-kicker">Evolution</p>
        <h2 id="archive-title">Historical work stays visible without competing with the new direction.</h2>
      </div>
      <div>
        <p>
          The estate world remains available as a historical visual R&D archive. It is not current
          cockpit or engine telemetry.
        </p>
        <a href="/estate">Historical visual R&D archive</a>
      </div>
    </section>
  )
}

export default function Cockpit() {
  useCockpitRouteClass()
  const { snapshot, error } = useSnapshot()

  return (
    <main className="kc-shell">
      <header className="kc-header">
        <a className="kc-wordmark" href="/" aria-label="Katabasis home">
          <span>Katabasis</span>
        </a>
        <nav aria-label="Katabasis public navigation">
          <a href="#overview">Overview</a>
          <a href="#public-private">Public / Private</a>
          <a href="#artifacts">Artifacts</a>
          <a href="#private-environment">Private Environment</a>
          <a href="/estate">Archive</a>
        </nav>
      </header>

      <Hero snapshot={snapshot} />
      <WhatKatabasisIs />
      <PublicPrivate />
      <SystemPillars />
      <Artifacts snapshot={snapshot} error={error} />
      <PrivateGateway />
      <Evolution />

      <footer className="kc-footer">
        <div>
          <strong>Katabasis</strong>
          <p>Public shell for a deeper private quantitative control environment.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#overview">Overview</a>
          <a href="#public-private">Public / Private</a>
          <a href="#private-environment">Private Environment</a>
          <a href="/estate">Archive</a>
        </nav>
      </footer>
    </main>
  )
}
