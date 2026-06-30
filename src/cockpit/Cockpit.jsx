import React, { useEffect, useMemo, useState } from 'react'
import './cockpit.css'

const TELEMETRY_URL = '/telemetry/demo_cockpit_snapshot.json'

const PANEL_ORDER = [
  ['flight_recorder', 'Flight Recorder'],
  ['research_ledger', 'Research Ledger'],
  ['volatility_topology', 'Volatility Topology'],
  ['private_tools', 'Gated Private Tools'],
  ['private_real_telemetry', 'Gated Real Telemetry'],
]

const STATE_TONE = {
  READY: 'ready',
  PARTIAL: 'partial',
  MISSING: 'missing',
  GATED: 'gated',
  PROPRIETARY_REDACTED: 'redacted',
  DEMO_SYNTHETIC: 'synthetic',
}

function StateBadge({ state }) {
  return <span className={`kc-state kc-state--${STATE_TONE[state] || 'missing'}`}>{state}</span>
}

function Metric({ label, value }) {
  return (
    <div className="kc-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function FlightRecorder({ panel }) {
  return (
    <div className="kc-panel__body">
      <div className="kc-metrics">
        <Metric label="Health" value={panel.summary?.demo_health || 'synthetic'} />
        <Metric label="Activity" value={panel.summary?.demo_activity || 'demo loop'} />
        <Metric label="Detail" value={panel.summary?.detail_level || 'coarse public shell'} />
      </div>
      <div className="kc-timeline">
        {(panel.coarse_events || []).map((event) => (
          <div className="kc-event" key={event.label}>
            <span className="kc-event__dot" />
            <div>
              <strong>{event.label}</strong>
              <p>{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ResearchLedger({ panel }) {
  return (
    <div className="kc-panel__body">
      <div className="kc-steps">
        {(panel.lifecycle || []).map((step, index) => (
          <div className="kc-step" key={step.phase}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>{step.phase.replaceAll('_', ' ')}</strong>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VolatilityTopology({ panel }) {
  const terms = panel.surface?.term_buckets || []
  const moneyness = panel.surface?.moneyness_buckets || []
  const cells = panel.surface?.cells || []
  const intensity = (term, bucket) => cells.find((cell) => cell.term === term && cell.moneyness === bucket)?.intensity || 'missing'

  return (
    <div className="kc-panel__body">
      <div className="kc-substrate">
        <Metric label="Universe" value={panel.illustrative_universe?.label || 'illustrative substrate'} />
        <Metric label="Real universe" value={panel.illustrative_universe?.is_real_traded_universe ? 'yes' : 'no'} />
        <Metric label="Units" value={panel.surface?.units || 'synthetic ordinal intensity'} />
      </div>
      <div className="kc-surface" style={{ '--kc-cols': moneyness.length }}>
        <div className="kc-surface__corner" />
        {moneyness.map((bucket) => (
          <div className="kc-surface__head" key={bucket}>{bucket}</div>
        ))}
        {terms.map((term) => (
          <React.Fragment key={term}>
            <div className="kc-surface__term">{term}</div>
            {moneyness.map((bucket) => {
              const value = intensity(term, bucket)
              return (
                <div className={`kc-cell kc-cell--${value}`} key={`${term}-${bucket}`}>
                  {value}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function GatedPanel({ panel }) {
  return (
    <div className="kc-panel__body">
      <div className="kc-gated">
        <strong>Payload unavailable on the public static surface.</strong>
        <p>{panel.requires || 'Future private authenticated server-side authorization required.'}</p>
      </div>
    </div>
  )
}

function PanelCard({ id, title, panel }) {
  const synthetic = panel.state === 'DEMO_SYNTHETIC' || panel.provenance === 'DEMO_SYNTHETIC'
  return (
    <section className="kc-panel">
      <header className="kc-panel__header">
        <div>
          <p className="kc-kicker">{panel.label}</p>
          <h2>{title}</h2>
        </div>
        <StateBadge state={panel.state} />
      </header>
      <p className="kc-purpose">{panel.purpose}</p>
      {synthetic && <div className="kc-synthetic">Synthetic demonstration payload. Not live engine output.</div>}
      {id === 'flight_recorder' && <FlightRecorder panel={panel} />}
      {id === 'research_ledger' && <ResearchLedger panel={panel} />}
      {id === 'volatility_topology' && <VolatilityTopology panel={panel} />}
      {(id === 'private_tools' || id === 'private_real_telemetry') && <GatedPanel panel={panel} />}
    </section>
  )
}

export default function Cockpit() {
  const [snapshot, setSnapshot] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function loadSnapshot() {
      try {
        const response = await fetch(TELEMETRY_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`Telemetry fixture returned ${response.status}`)
        const data = await response.json()
        if (!cancelled) setSnapshot(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load telemetry fixture')
      }
    }
    loadSnapshot()
    return () => {
      cancelled = true
    }
  }, [])

  const panels = useMemo(() => {
    if (!snapshot?.panels) return []
    return PANEL_ORDER.map(([id, title]) => [id, title, snapshot.panels[id]]).filter(([, , panel]) => panel)
  }, [snapshot])

  return (
    <main className="kc-shell">
      <section className="kc-hero">
        <div>
          <p className="kc-eyebrow">Katabasis Cockpit</p>
          <h1>Public telemetry surface</h1>
          <p className="kc-deck">
            A static, recruiter-safe observability slice for system state, research provenance, and options-native substrate.
          </p>
        </div>
        <div className="kc-badge">
          <span>PUBLIC DEMO</span>
          <strong>DEMO_SYNTHETIC</strong>
        </div>
      </section>

      {!snapshot && !error && <div className="kc-status">Loading public demo telemetry...</div>}
      {error && (
        <div className="kc-status kc-status--error">
          <strong>Telemetry fixture unavailable.</strong>
          <span>{error}</span>
        </div>
      )}

      {snapshot && (
        <>
          <section className="kc-meta">
            <Metric label="Mode" value={snapshot.mode} />
            <Metric label="Provenance" value={snapshot.provenance} />
            <Metric label="Schema" value={snapshot.schema_version} />
          </section>

          <section className="kc-grid">
            {panels.map(([id, title, panel]) => (
              <PanelCard key={id} id={id} title={title} panel={panel} />
            ))}
          </section>

          <footer className="kc-safety">
            <span>Static assets are public.</span>
            <span>This page uses synthetic/public-safe payloads only.</span>
            <span>Real telemetry is not shipped in this repo.</span>
          </footer>
        </>
      )}
    </main>
  )
}
