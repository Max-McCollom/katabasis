import { resultExhibits } from './exhibits.js'

function CostMatrix({ data }) {
  return <table className="cost-matrix"><caption className="visually-hidden">Historical criteria by transaction-cost assumption</caption><colgroup><col className="criterion-column" /><col /><col /><col /></colgroup><thead><tr><th scope="col" rowSpan="2">Study criterion</th><th scope="colgroup" colSpan="3">Transaction-cost assumption</th></tr><tr>{data.assumptions.map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{data.criteria.map((criterion, i) => <tr key={criterion}><th scope="row">{criterion}</th>{data.cells[i].map((value, j) => <td key={j}><span aria-hidden="true">✓ </span>{value}</td>)}</tr>)}</tbody></table>
}

function Compatibility({ data }) {
  return <><p className="diagnostic-record"><strong>Diagnostic comparison.</strong> A mechanism-free placebo showed a similar apparent effect, prompting a review of the price conventions.</p><div className="compatibility-diagram">{[{ label: 'Incompatible conventions', fields: data.before, outcome: data.outcomes[0] }, { label: 'Compatible fields required', fields: data.after, outcome: data.outcomes[1] }].map((lane, i) => <section className={'compatibility-lane lane-' + i} key={lane.label}><h4>{lane.label}</h4><dl className="price-fields">{lane.fields.map(field => <div key={field.field}><dt>{field.field}</dt><dd>{field.convention}</dd></div>)}</dl><div className="diagram-connector" aria-hidden="true">↓</div><p><strong>{lane.outcome.label}</strong><br />{lane.outcome.value}</p></section>)}</div></>
}

function Validation({ data }) {
  return <div className="validation-diagram"><div className="validation-tests">{data.rows.slice(0, 2).map(row => <section key={row.test}><h4>{row.test}</h4><p className="result-label">{row.result}</p><p>{row.interpretation}</p></section>)}</div><div className="converging-lines" aria-hidden="true"><span>↓</span><span>↓</span></div><section className="validation-conclusion"><h4>{data.rows[2].test}</h4><p className="result-label">{data.rows[2].result}</p><p>{data.rows[2].interpretation}</p></section></div>
}

function Rubric({ data }) {
  return <div className="rubric-diagram"><h4>Economic requirements retained</h4><ul className="rubric-criteria">{data.retained.map(item => <li key={item}>{item}</li>)}</ul><div className="rubric-revision"><section><h4>Earlier framing</h4><p>{data.revision.before}</p></section><span aria-hidden="true">→</span><section><h4>Revised framing</h4><p>{data.revision.after}</p></section></div><p className="exhibit-decision"><strong>Design decision.</strong> {data.decision}</p></div>
}

function OutcomeRows({ data }) {
  return <>{data.groups && <div className="outcome-groups">{data.groups.map(group => <section key={group.label}><h4>{group.label}</h4><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></section>)}</div>}<div className="outcome-ledger">{data.rows.map(row => <section key={row[0]}><h4>{row[0]}</h4><dl><div><dt>{data.columns[1]}</dt><dd>{row[1]}</dd></div><div><dt>{data.columns[2]}</dt><dd>{row[2]}</dd></div></dl></section>)}</div></>
}

export default function ResearchExhibit({ exhibitId, instance = 'result' }) {
  const data = resultExhibits[exhibitId]
  if (!data) return null
  const titleId = instance + '-' + exhibitId + '-title'
  const captionId = instance + '-' + exhibitId + '-caption'
  const renderers = { 'cost-matrix': CostMatrix, compatibility: Compatibility, validation: Validation, rubric: Rubric, outcomes: OutcomeRows }
  const Diagram = renderers[data.type]
  return <figure className={'research-exhibit exhibit-' + data.type} aria-labelledby={titleId} aria-describedby={captionId}><figcaption><p className="section-label">{data.kind}</p><h3 id={titleId}>{data.title}</h3><p id={captionId}>{data.caption}</p></figcaption>
    {Diagram ? <Diagram data={data} /> : <dl className="workflow-record">{data.rows.map(row => <div key={row.field}><dt>{row.field}</dt><dd>{row.value}</dd></div>)}</dl>}
    <div className="exhibit-notes">{data.notes.map(note => <p key={note}>{note}</p>)}<p className="record-meta">{data.sourceLabel}</p></div>
  </figure>
}

export function ProcessDiagram({ steps, title }) {
  return <figure className="process-diagram"><figcaption><span className="section-label">Explanatory schematic</span><h3>{title}</h3></figcaption><ol>{steps.map(step => <li key={step.label}><h4>{step.label}</h4><p>{step.description}</p></li>)}</ol></figure>
}

export function ObservationDiagram() {
  return <figure className="observation-diagram"><figcaption><p className="section-label">Explanatory schematic</p><h3>Event identity and outcome dependence</h3></figcaption><div className="observation-source">A financial event</div><div className="diagram-connector" aria-hidden="true">↓</div><div className="observation-labels">Related outcome labels at multiple horizons</div><p>Retaining event identity helps identify related observations so they can be evaluated without treating each label as an independent repetition. The diagram represents a relationship, with no event count or measured time scale.</p></figure>
}
