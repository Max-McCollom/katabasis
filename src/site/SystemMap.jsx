import { useId, useState } from 'react'
import { systemGroups, systemPages } from './systems.js'
import { subsystemPath } from './navigation.js'

const guideHref = subsystemPath

export default function SystemMap({ initialId = 'hypothesis-discovery' }) {
  const uniqueId = 'component-map-' + useId().replaceAll(':', '')
  const [selectedId, setSelectedId] = useState(initialId)
  const selected = systemPages.find(item => item.id === selectedId) || systemPages[0]
  if (!selected) return null

  const outgoing = selected.connections
    .map(connection => ({ ...connection, target: systemPages.find(item => item.id === connection.id) }))
    .filter(connection => connection.target)
  const incoming = systemPages.filter(item => item.connections.some(connection => connection.id === selected.id))
  const relatedIds = new Set([...outgoing.map(connection => connection.id), ...incoming.map(item => item.id)])
  relatedIds.delete(selected.id)

  const namedStage = (id, fallback) => {
    const item = systemPages.find(page => page.id === id)
    return { label: item?.title || fallback, href: item ? guideHref(item) : undefined }
  }
  const handoffs = [
    {
      title: 'Observation to evidence review',
      stages: [namedStage('forward-observer', 'Prospective Observation'), { label: 'Evidence adapter' }, namedStage('evidence-evaluation', 'Evidence Evaluation')],
      description: 'An adapter reshapes recorded observations and later outcomes for evidence evaluation.',
    },
    {
      title: 'Historical result to acceptance review',
      stages: [{ label: 'Replay and sensitivity records', href: guideHref(systemPages.find(item => item.id === 'simulation-replay')) }, { label: 'Acceptance review', href: guideHref(systemPages.find(item => item.id === 'evidence-evaluation')) }],
      description: 'The research acceptance boundary considers replay, sensitivity and the supporting evidence package.',
    },
    {
      title: 'Research state to human review',
      stages: [{ label: 'Research state', href: guideHref(systemPages.find(item => item.id === 'research-executive')) }, { label: 'Read-only projection' }, namedStage('operator-console', 'Research Monitoring')],
      description: 'Research-assignment, evidence and source-state records reach a read-only review surface.',
    },
  ]

  return <section className="system-map" aria-labelledby={uniqueId + '-title'}>
    <div className="system-map-intro">
      <h2 id={uniqueId + '-title'}>Research components and relationships</h2>
      <p id={uniqueId + '-instructions'}>Select a component to inspect related research roles and open its guide. Each guide records its own implementation and evidence status.</p>
      <p id={uniqueId + '-related-hint'} hidden>Related to the selected component.</p>
    </div>

    <div className="system-map-groups">
      {systemGroups.map(group => <section className="system-map-group" key={group.id} aria-labelledby={uniqueId + '-' + group.id}>
        <h3 id={uniqueId + '-' + group.id}>{group.title}</h3>
        <ul className="system-map-nodes">
          {systemPages.filter(item => item.group === group.id).map(item => {
            const isSelected = item.id === selected.id
            const isRelated = relatedIds.has(item.id)
            return <li key={item.id}>
              <button
                type="button"
                className={'system-map-node' + (isSelected ? ' is-selected' : isRelated ? ' is-related' : '')}
                aria-label={item.title}
                aria-pressed={isSelected}
                aria-controls={uniqueId + '-detail'}
                aria-describedby={isRelated ? uniqueId + '-related-hint' : undefined}
                onClick={() => setSelectedId(item.id)}
              >
                <span className="system-map-node-title">{item.title}</span>
                {(isSelected || isRelated) && <span className="system-map-node-state" aria-hidden="true">{isSelected ? 'Selected' : 'Related'}</span>}
              </button>
            </li>
          })}
        </ul>
      </section>)}
    </div>

    <div className="system-map-detail" id={uniqueId + '-detail'} role="region" aria-labelledby={uniqueId + '-selected-title'} aria-live="polite" aria-atomic="true">
      <div className="system-map-detail-heading">
        <h3 id={uniqueId + '-selected-title'}>{selected.title}</h3>
        <a className="system-map-guide" href={guideHref(selected)}>Open the guide</a>
      </div>
      <p>{selected.deck}</p>
      <h4>Related research roles</h4>
      <ul className="system-map-relationships">
        {outgoing.map(connection => <li key={connection.id}>
          <a href={guideHref(connection.target)}>{connection.target.title}</a>
          <p>{connection.reason}</p>
        </li>)}
      </ul>
    </div>

    <section className="system-handoffs" aria-labelledby={uniqueId + '-handoffs-title'}>
      <h3 id={uniqueId + '-handoffs-title'}>Documented research handoffs</h3>
      <p className="system-handoff-note">Schematic summaries of documented interfaces and review paths. Current operating readiness is described in each guide.</p>
      <div className="system-handoff-list">
        {handoffs.map(handoff => <section className="system-handoff" key={handoff.title}>
          <h4>{handoff.title}</h4>
          <ol className="system-handoff-stages">
            {handoff.stages.map(stage => <li key={stage.label}>{stage.href ? <a href={stage.href}>{stage.label}</a> : <span>{stage.label}</span>}</li>)}
          </ol>
          <p>{handoff.description}</p>
        </section>)}
      </div>
    </section>
  </section>
}
