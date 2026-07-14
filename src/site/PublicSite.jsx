import { useEffect, useState } from 'react'
import '@fontsource-variable/newsreader/wght.css'
import './site.css'

const missionStages = [
  {
    label: 'Question',
    title: 'Could robotics growth create a shortage in precision motion-control parts?',
    summary: 'The mission record includes the question, decision target, budget, and read-only permission level.',
    why: 'Specify the research question.',
    used: 'Operator input: question, decision target, budget, and permissions.',
    next: 'Record competing hypotheses and their invalidation criteria.',
  },
  {
    label: 'Hypotheses',
    title: 'Broad suppliers benefit, value concentrates upstream, or demand is too small.',
    summary: 'The planner stores three hypotheses separately so they can receive different evidence.',
    why: 'Define alternatives that can be tested independently.',
    used: 'Mission question and invalidation criteria.',
    next: 'Create tasks that can distinguish between the hypotheses.',
  },
  {
    label: 'First work',
    title: 'Map suppliers, measure exposure, and inspect qualification constraints.',
    summary: 'The router checks task dependencies, permissions, and remaining budget before dispatch.',
    why: 'Collect the inputs required by the first hypothesis checks.',
    used: 'Task graph, available routes, and remaining budget.',
    next: 'Apply the recorded threshold to the broad-exposure result.',
  },
  {
    label: 'Check',
    title: 'Do broad bearing manufacturers have enough exposure to carry the thesis?',
    summary: 'A deterministic check reads the validated output. Its threshold was recorded before the result arrived.',
    why: 'Test the broad-exposure hypothesis.',
    used: 'Validated exposure research.',
    next: 'Keep the current plan or apply the recorded replan rule.',
  },
  {
    label: 'Result',
    title: 'The broad-exposure result is below the recorded threshold.',
    summary: 'The result weakens the broad-supplier hypothesis. The other hypotheses remain unresolved.',
    why: 'Update the affected hypothesis.',
    used: 'Check result and its source record.',
    next: 'Replace lower-value work with a narrower upstream investigation.',
  },
  {
    label: 'Plan change',
    title: 'Add specialized-component research and update a task dependency.',
    summary: 'The revision keeps the original budget and permission level. The triggering result is stored with the plan-change event.',
    why: 'Continue work on the unresolved upstream hypothesis.',
    used: 'Recorded replan rule and unresolved hypotheses.',
    next: 'Use the new evidence in the counter-thesis and ranking tasks.',
  },
  {
    label: 'Current state',
    title: 'Broad-supplier exposure is weak; specialized-component exposure remains unresolved.',
    summary: 'The current conclusion and the unresolved hypothesis are stored separately.',
    why: 'Report the result at the level supported by the evidence.',
    used: 'Validated evidence, contradictions, and completion rules.',
    next: 'Continue the remaining tasks or stop at the current conclusion.',
  },
]

const routeMetadata = {
  home: ['Katabasis | Research software by Max McCollom', 'Katabasis is software for planning investment research, running analysis, checking evidence, and recording changes to a research plan.'],
  system: ['How Katabasis Works | System Architecture', 'How Katabasis stores missions, routes tasks, checks evidence, records run outcomes, replans, and recovers.'],
  work: ['Selected Work | Katabasis', 'Selected Katabasis engineering cases about data integrity, robustness, and permission controls.'],
  dataCase: ['Data Mismatch in a Return Calculation | Katabasis', 'A case study about finding and correcting incompatible price fields in a research calculation.'],
  narrowedCase: ['Reproduction and Timing Robustness | Katabasis', 'A case summary about the difference between reproducing a result and showing that the claim is robust.'],
  notes: ['Engineering Notes | Katabasis', 'Engineering notes from building Katabasis.'],
  refusalNote: ['Handling a Task Without Model Permission | Katabasis', 'How Katabasis records a task that is refused because model access was not approved.'],
  about: ['Max McCollom | Builder of Katabasis', 'About Max McCollom and the engineering work behind Katabasis.'],
  archive: ['Earlier Visual Research | Katabasis Archive', 'Earlier visual research created during the development of Katabasis.'],
  notFound: ['Page Not Found | Katabasis', 'The requested Katabasis page was not found.'],
}

function routeForPath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return { page: 'home', section: 'home' }
  if (path === '/system') return { page: 'system', section: 'system' }
  if (path === '/work') return { page: 'work', section: 'work' }
  if (path === '/work/data-mismatch') return { page: 'dataCase', section: 'work' }
  if (path === '/work/narrowed-claim') return { page: 'narrowedCase', section: 'work' }
  if (path === '/notes') return { page: 'notes', section: 'notes' }
  if (path === '/notes/safe-refusal') return { page: 'refusalNote', section: 'notes' }
  if (path === '/about') return { page: 'about', section: 'about' }
  if (path === '/archive') return { page: 'archive', section: 'archive' }
  return { page: 'notFound', section: '' }
}

function usePublicRoute(page) {
  useEffect(() => {
    const [title, description] = routeMetadata[page]
    document.title = title
    document.documentElement.classList.add('public-site-route')
    document.body.classList.add('public-site-route')
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)

    const target = window.location.hash && document.querySelector(window.location.hash)
    if (target) requestAnimationFrame(() => target.scrollIntoView())

    return () => {
      document.documentElement.classList.remove('public-site-route')
      document.body.classList.remove('public-site-route')
    }
  }, [page])
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight
      setProgress(available > 0 ? Math.min(100, Math.max(0, (window.scrollY / available) * 100)) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return <div className="reading-progress" style={{ '--reading-progress': `${progress}%` }} aria-hidden="true" />
}

function Mark() {
  return <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M4 5.5h20M7.5 10h13M10.5 14.5h7M8.5 19h11M5 23.5h18" /></svg>
}

function Header({ section }) {
  const [open, setOpen] = useState(false)
  const links = [['system', 'System'], ['work', 'Work'], ['notes', 'Notes'], ['about', 'About']]
  return (
    <header className={`site-header${open ? ' is-open' : ''}`}>
      <div className="header-inner">
        <a className="wordmark" href="/" aria-label="Katabasis home"><Mark /><span>Katabasis</span></a>
        <button className="menu-button" type="button" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((value) => !value)}><span>Menu</span><i aria-hidden="true" /></button>
        <nav className="site-nav" id="site-nav" aria-label="Primary navigation">
          {links.map(([id, label]) => <a href={`/${id}/`} aria-current={section === id ? 'page' : undefined} key={id}>{label}</a>)}
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand"><strong>Katabasis</strong><p>Research software by Max McCollom.</p></div>
        <nav className="footer-nav" aria-label="Footer navigation"><a href="/system/">System</a><a href="/work/">Selected Work</a><a href="/notes/">Engineering Notes</a><a href="/about/">About</a></nav>
        <a className="archive-footer-link" href="/archive/">Earlier visual research<span>Archive ↗</span></a>
      </div>
    </footer>
  )
}

function Shell({ page, section, progress = false, children }) {
  usePublicRoute(page)
  return <>{progress && <ReadingProgress />}<a className="skip-link" href="#main">Skip to content</a><Header section={section} />{children}<Footer /></>
}

function FigureCaption({ number = '01', children }) {
  return <figcaption className="figure-caption"><span>Figure {number}</span><strong>{children}</strong></figcaption>
}

function MissionExample() {
  const [active, setActive] = useState(0)
  const stage = missionStages[active]

  function move(event, index) {
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    let next = index
    if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = missionStages.length - 1
    else next = (index + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1) + missionStages.length) % missionStages.length
    setActive(next)
    event.currentTarget.parentElement.querySelectorAll('button')[next]?.focus()
  }

  return (
    <section className="home-mission shell" aria-labelledby="mission-title">
      <div className="mission-heading"><div><p className="eyebrow">Example mission</p><h2 id="mission-title">Research on robotics suppliers</h2></div><p>The example uses the task structure of an actual mission. Company names, sources, rankings, values, and the conclusion are removed.</p></div>
      <div className="mission-console">
        <div className="mission-steps" role="tablist" aria-label="Mission steps">
          {missionStages.map((item, index) => <button className={`mission-step${index === active ? ' is-active' : ''}`} type="button" role="tab" aria-selected={index === active} tabIndex={index === active ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => move(event, index)} key={item.label}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.label}</strong></button>)}
        </div>
        <article className="mission-detail" role="tabpanel" aria-live="polite">
          <div className="mission-detail-meta"><span>{String(active + 1).padStart(2, '0')} / 07</span><span>{stage.label}</span></div>
          <h3>{stage.title}</h3><p>{stage.summary}</p>
          <dl><div><dt>Purpose</dt><dd>{stage.why}</dd></div><div><dt>Inputs</dt><dd>{stage.used}</dd></div><div><dt>Next</dt><dd>{stage.next}</dd></div></dl>
        </article>
      </div>
    </section>
  )
}

function HomePage() {
  return (
    <Shell page="home" section="home">
      <main id="main">
        <section className="home-hero shell" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <p className="eyebrow">Research software by Max McCollom</p>
            <h1 id="home-title">Katabasis is software for planning and running investment research.</h1>
            <p className="home-hero-lede">It stores the research question, task plan, source records, analysis outputs, and current conclusion in one mission record.</p>
            <p className="home-hero-boundary">The research director described on this site is read-only. It cannot place trades or change its own permissions. Strategies, positions, sources, and live operating data are not published.</p>
            <div className="home-hero-actions"><a className="text-link text-link-accent" href="/system/">System design</a><a className="text-link" href="/work/data-mismatch/">Data-integrity case</a></div>
          </div>
          <figure className="record-figure">
            <FigureCaption>Contents of a mission record</FigureCaption>
            <div className="record-sheet">
              <div className="record-row"><span>Input</span><div><strong>Research question</strong><p>Objective, decision target, budget, permission level</p></div></div>
              <div className="record-row"><span>Plan</span><div><strong>Hypotheses and tests</strong><p>Tasks, dependencies, checks, stopping rules</p></div></div>
              <div className="record-row"><span>Work</span><div><strong>Sources and analysis</strong><p>Route, inputs, output, and evidence references</p></div></div>
              <div className="record-row is-change"><span>Revision</span><div><strong>Updated hypothesis and task plan</strong><p>The reason for the change remains in the event history</p></div></div>
              <div className="record-row"><span>Output</span><div><strong>Current conclusion</strong><p>Unresolved questions are stored with it</p></div></div>
            </div>
          </figure>
        </section>

        <section className="home-built" aria-labelledby="built-title"><div className="shell">
          <div className="split-heading"><div><p className="eyebrow">Implementation</p><h2 id="built-title">Mission state is stored in SQLite.</h2></div><p>The objective, budget, permissions, tasks, evidence, and plan revisions are separate database records.</p></div>
          <div className="built-sequence">
            <article className="built-row"><h3>Mission setup</h3><p>The operator enters a research question, decision target, budget, permission level, hypotheses, and stopping rules.</p></article>
            <article className="built-row"><h3>Task routing</h3><p>Tasks can use source research, local analysis, document extraction, or synthesis over validated evidence. The router checks permissions, availability, input type, and budget.</p></article>
            <article className="built-row"><h3>Evidence validation</h3><p>Findings include a source date, access time, evidence class, confidence, and references to the hypotheses they affect.</p></article>
            <article className="built-row"><h3>Plan revision</h3><p>A result can update one hypothesis, add a task, change a dependency, or stop the mission. Each change is written to the event history.</p></article>
          </div>
          <div className="built-footer"><a className="text-link" href="/system/">System architecture</a></div>
        </div></section>

        <MissionExample />

        <section className="home-work" aria-labelledby="home-work-title"><div className="shell">
          <div className="split-heading"><div><p className="eyebrow">Selected work</p><h2 id="home-work-title">Three cases from development</h2></div><p>These summaries cover the engineering issue and the resulting change. Private research details are removed.</p></div>
          <div className="home-work-list">
            <a className="home-work-item" href="/work/data-mismatch/"><span>01</span><div><h3>Data mismatch in a return calculation</h3><p>A calculation mixed adjusted and unadjusted price fields. A placebo test exposed the error, and the loader was changed to reject incompatible inputs.</p></div><small>Full case study</small><i aria-hidden="true">↗</i></a>
            <a className="home-work-item" href="/work/narrowed-claim/"><span>02</span><div><h3>Reproduction passed; timing robustness failed</h3><p>An exact rerun matched the original output. A timing shift invalidated one part of the claim.</p></div><small>Case summary</small><i aria-hidden="true">↗</i></a>
            <a className="home-work-item" href="/notes/safe-refusal/"><span>03</span><div><h3>Handling a task without model permission</h3><p>The router refused the task before dispatch and left the mission paused for operator approval.</p></div><small>Engineering note</small><i aria-hidden="true">↗</i></a>
          </div>
        </div></section>

        <section className="builder-strip"><div className="shell builder-strip-grid"><div><p className="eyebrow">Max McCollom</p><h2>I built the research pipeline, database, policy checks, tests, public site, and macOS app.</h2></div><div><p>I study financial economics at Columbia University. Katabasis has been an independent project since June 2026.</p><a className="text-link" href="/about/">About the project</a></div></div></section>
      </main>
    </Shell>
  )
}

function SystemPage() {
  const chapters = [['contract', 'Mission inputs'], ['plan', 'Task dependencies'], ['routing', 'Task routing'], ['evidence', 'Evidence records'], ['belief', 'Plan revision'], ['outcomes', 'Run status'], ['history', 'Recovery'], ['boundary', 'Permissions']]
  return (
    <Shell page="system" section="system" progress>
      <main id="main">
        <section className="page-hero shell"><div className="page-hero-grid"><div className="page-hero-copy"><p className="eyebrow">System</p><h1>How a research mission runs</h1><p>This page describes the stored mission state, task routing, evidence checks, plan revisions, and recovery behavior in the current research director.</p></div><aside className="page-hero-aside"><p>Scope</p><strong>Read-only research</strong><p>Brokerage and live execution are excluded</p></aside></div></section>
        <section className="system-map shell"><figure className="system-map-figure"><FigureCaption>Mission loop and permission boundary</FigureCaption><div className="system-map-flow"><div className="system-map-node"><span>01</span><strong>Question</strong></div><i className="system-map-arrow" aria-hidden="true" /><div className="system-map-node"><span>02</span><strong>Task plan</strong></div><i className="system-map-arrow" aria-hidden="true" /><div className="system-map-node"><span>03</span><strong>Worker</strong></div><i className="system-map-arrow" aria-hidden="true" /><div className="system-map-node"><span>04</span><strong>Evidence</strong></div></div><div className="system-map-boundary"><div><span className="figure-label">Permission boundary</span><p>The router can select research tasks only within the permission level set by the operator.</p></div><ul><li>Offline analysis</li><li>Live data, read-only</li><li>Execution remains outside this director</li></ul></div></figure></section>
        <section className="system-body"><div className="shell system-layout">
          <nav className="chapter-nav" aria-label="System chapters"><p className="eyebrow">On this page</p><ol>{chapters.map(([id, label], index) => <li key={id}><a href={`#${id}`}><span>{String(index + 1).padStart(2, '0')}</span>{label}</a></li>)}</ol></nav>
          <div className="system-chapters">
            <section className="system-chapter" id="contract"><p className="section-index">01 · Mission contract</p><h2>Mission inputs</h2><p>The operator supplies the research question, the decision the work should support, a spending and time budget, and the highest permission level available to the mission.</p><p>The same record stores the initial hypotheses, invalidation criteria, and rules for completion, stopping, and replanning. Plan revisions cannot increase the budget or permission level.</p><dl className="contract-record"><div><dt>Objective</dt><dd>What should be investigated?</dd></div><div><dt>Decision target</dt><dd>What decision should the research make easier?</dd></div><div><dt>Budget</dt><dd>Maximum spending, model calls, and elapsed work time.</dd></div><div><dt>Permission level</dt><dd>The most privileged worker the mission may use.</dd></div><div><dt>Hypotheses</dt><dd>Separate explanations that can receive different evidence.</dd></div><div><dt>Stop rules</dt><dd>Completion, exhausted budget, missing permission, or no useful work left.</dd></div></dl></section>
            <section className="system-chapter" id="plan"><p className="section-index">02 · Task plan</p><h2>Task dependencies</h2><p>The planner creates tasks such as mapping a market, measuring exposure, checking capacity constraints, building a counter-thesis, comparing scenarios, and defining monitoring work.</p><p>Each task records its dependencies, required work type, and expected output. Missing prerequisites block the task instead of being replaced with guessed inputs.</p><figure className="task-graph" aria-label="Example task dependency graph"><div className="graph-row"><div className="graph-node"><span>TASK 01</span><strong>Map suppliers</strong><p>No dependency</p></div><div className="graph-node"><span>TASK 02</span><strong>Measure broad exposure</strong><p>Uses supplier map</p></div><div className="graph-node"><span>TASK 03</span><strong>Check constraints</strong><p>Uses supplier map</p></div></div><div className="graph-connection" aria-hidden="true" /><div className="graph-row"><div className="graph-node is-new"><span>ADDED AFTER RESULT</span><strong>Measure specialized exposure</strong><p>Reason stored in history</p></div><div className="graph-node"><span>TASK 05</span><strong>Build counter-thesis</strong><p>Dependency changed</p></div><div className="graph-node"><span>TASK 06</span><strong>Define monitoring</strong><p>Waits for analysis</p></div></div></figure></section>
            <section className="system-chapter" id="routing"><p className="section-index">03 · Capability routing</p><h2>Task routing</h2><p>Before dispatch, the router checks required permissions, input type, availability, expected cost, and the mission&apos;s remaining budget. Rejected routes and their reasons are stored with the task.</p><table className="routing-table"><thead><tr><th>Worker type</th><th>Used for</th><th>Important limit</th></tr></thead><tbody><tr><td>Source research</td><td>Retrieve public sources and return structured findings.</td><td>Read-only and opt-in for each invocation.</td></tr><tr><td>Local analysis</td><td>Run deterministic calculations over validated inputs.</td><td>Malformed and unsupported inputs become typed gaps.</td></tr><tr><td>Document extraction</td><td>Read a bounded section of an approved local document.</td><td>Rejects secrets, unsafe paths, and excessive reads.</td></tr><tr><td>Evidence synthesis</td><td>Identify tensions and unresolved questions in validated evidence.</td><td>Cannot retrieve new facts or raise an evidence grade.</td></tr></tbody></table><p>If no route fits, the task is recorded as a capability gap and remains incomplete.</p></section>
            <section className="system-chapter" id="evidence"><p className="section-index">04 · Evidence checks</p><h2>Evidence records</h2><p>Research findings include a direct source, source date, access time, evidence class, confidence, and references to the hypotheses they affect. Structured outputs point back to findings that passed the same validation step.</p><p>Valid citations satisfy the retrieval check. Support for a hypothesis is evaluated separately and can remain unresolved.</p><figure className="evidence-specimen"><figcaption className="evidence-specimen-label"><span className="figure-label">Sanitized record</span><strong>Evidence item</strong><p>No private source or finding is shown.</p></figcaption><dl className="evidence-fields"><div><dt>Claim</dt><dd>One specific statement from the source</dd></div><div><dt>Class</dt><dd>Fact, estimate, or inference</dd></div><div><dt>Source date</dt><dd>The date the source describes or was published</dd></div><div><dt>Access time</dt><dd>When the source was retrieved</dd></div><div><dt>Affects</dt><dd>The hypotheses this item supports or weakens</dd></div><div><dt>Status</dt><dd>Valid, rejected, or superseded</dd></div></dl></figure></section>
            <section className="system-chapter" id="belief"><p className="section-index">05 · Belief changes</p><h2>Updating hypotheses and the task plan</h2><p>Evidence updates individual hypotheses. A hypothesis can remain unresolved, receive provisional support, become weaker, or become contested by conflicting evidence.</p><p>A replan rule can add tasks or change dependencies when a specific result arrives. The event stores the triggering evidence, reason, and new work. The original plan remains visible.</p><div className="event-timeline"><div className="event-item"><span>BEFORE</span><strong>Three hypotheses remain open</strong><p>Broad suppliers, specialized upstream value, or immaterial demand.</p></div><div className="event-item"><span>RESULT</span><strong>Broad exposure is below the threshold</strong><p>The result affects one hypothesis, not the entire mission.</p></div><div className="event-item"><span>REPLAN</span><strong>Two specialized research tasks are added</strong><p>The reason and changed dependency are recorded.</p></div><div className="event-item"><span>AFTER</span><strong>The broad claim is weaker; the upstream question remains open</strong><p>The conclusion narrows without hiding the earlier plan.</p></div></div></section>
            <section className="system-chapter" id="outcomes"><p className="section-index">06 · Run outcomes</p><h2>Run status fields</h2><p>Execution, safety, scientific result, diagnostic value, and required operator action are stored independently. A refused task can therefore have a passed safety check, and a completed calculation can have a negative scientific result.</p><table className="outcome-table"><thead><tr><th>Example</th><th>Execution</th><th>Safety</th><th>Scientific result</th><th>Operator action</th></tr></thead><tbody><tr><td>Valid source retrieval</td><td>Completed</td><td>Passed</td><td>Still unresolved</td><td>None</td></tr><tr><td>Deterministic test refutes claim</td><td>Completed</td><td>Passed</td><td>Claim weakened</td><td>Review</td></tr><tr><td>Model consent absent</td><td>Refused</td><td>Passed</td><td>Not applicable</td><td>Approve or leave paused</td></tr><tr><td>Malformed evidence</td><td>Completed</td><td>Passed</td><td>Evidence rejected</td><td>Correct input</td></tr></tbody></table></section>
            <section className="system-chapter" id="history"><p className="section-index">07 · Recovery and history</p><h2>Recovery after an interrupted run</h2><p>Mission events are append-only. Concurrent runs on the same mission are locked. Spending is recorded before a result is committed. If a process dies after dispatch, the orphaned work can be identified and retried without marking the first attempt complete.</p><p>Some state is stored as a current projection for fast reads. The event history records how that state changed. The current version does not claim that every projection can already be rebuilt from events alone.</p><div className="event-timeline"><div className="event-item"><span>ATTEMPT 01</span><strong>Task dispatched</strong><p>Route, budget, permission, and inputs are recorded.</p></div><div className="event-item"><span>PROCESS LOST</span><strong>No terminal result exists</strong><p>The live lock is no longer held.</p></div><div className="event-item"><span>RECOVERY</span><strong>Attempt 01 is marked orphaned</strong><p>No output is created for the missing result.</p></div><div className="event-item"><span>ATTEMPT 02</span><strong>A new attempt begins</strong><p>The history keeps both attempts.</p></div></div></section>
            <section className="system-chapter" id="boundary"><p className="section-index">08 · Permission boundary</p><h2>Permissions</h2><p>The current mission director has no path to a broker, private portfolio state, or live execution. Model access is opt-in for each invocation. A run without that consent pauses at the model task and can resume later after approval.</p><p>The wider private Katabasis system separates research, paper execution, and live operation. This public site describes the boundary without exposing the private data behind it.</p><h3 className="meta-label">What this page does not claim</h3><ul className="not-claims"><li>Synthetic tests prove the machinery, not an investment thesis.</li><li>A citation does not prove a conclusion.</li><li>A completed mission does not grant trading authority.</li><li>The public diagrams do not expose strategies, positions, parameters, or live state.</li><li>Katabasis is an independent project, not an established firm or finished commercial product.</li></ul></section>
          </div>
        </div></section>
      </main>
    </Shell>
  )
}

function WorkPage() {
  return <Shell page="work" section="work"><main id="main"><section className="work-hero shell"><div className="work-hero-grid"><div className="work-hero-copy"><p className="eyebrow">Selected work</p><h1>Three engineering cases from Katabasis</h1><p>The cases cover a data error, a failed robustness test, and a permission refusal. Each one describes the problem, the check, and the resulting change.</p></div><aside className="work-hero-aside"><p>Published</p><strong>Engineering details</strong><p>Strategies, values, sources, and live state are removed</p></aside></div></section><section className="work-index shell" aria-label="Case studies"><a className="featured-case" href="/work/data-mismatch/"><div className="featured-case-meta"><p className="case-number">Case 01</p><p className="meta-label">Data integrity</p></div><div className="featured-case-copy"><h2>Data mismatch in a return calculation</h2><p>The calculation mixed adjusted close with unadjusted open. A placebo displayed the same pattern. I traced the inputs through the loader, corrected the data path, and reran the analysis.</p></div><aside className="featured-case-side"><span>Status</span><strong>Full public case study ↗</strong></aside></a><a className="case-row" href="/work/narrowed-claim/"><div><p className="case-number">Case 02</p><p className="meta-label">Robustness</p></div><div><h2>Reproduction passed; timing robustness failed</h2><p>An exact rerun matched the original output. A timing shift then invalidated one part of the claim.</p></div><aside>Public summary<br />Private evidence withheld<br />Read case ↗</aside></a><a className="case-row" href="/notes/safe-refusal/"><div><p className="case-number">Case 03</p><p className="meta-label">Permissions</p></div><div><h2>Task refused because model access was not approved</h2><p>The router stopped before dispatch, recorded execution as refused and safety as passed, and left the mission paused.</p></div><aside>Engineering note<br />Read note ↗</aside></a></section></main></Shell>
}

function CaseShell({ page, title, lede, facts, outline, children }) {
  return <Shell page={page} section="work" progress><main id="main"><section className="case-hero shell"><div className="case-hero-grid"><div className="case-hero-copy"><p className="eyebrow">{page === 'dataCase' ? 'Case study 01 · Data integrity' : 'Case study 02 · Robustness'}</p><h1>{title}</h1><p>{lede}</p></div><dl className="case-hero-facts">{facts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl></div></section><section className="case-body"><div className="shell case-layout"><nav className="case-outline" aria-label="Case study sections"><p className="eyebrow">Case record</p><ol>{outline.map(([id, label], index) => <li key={id}><a href={`#${id}`}><span>{String(index + 1).padStart(2, '0')}</span>{label}</a></li>)}</ol></nav><article className="case-story">{children}</article></div></section></main></Shell>
}

function DataCasePage() {
  const outline = [['question', 'Question'], ['belief', 'Initial result'], ['falsifier', 'Invalidation criteria'], ['check', 'Placebo and audit'], ['failure', 'Affected output'], ['correction', 'Loader change'], ['current', 'Conclusion'], ['private', 'Private details']]
  return <CaseShell page="dataCase" title="Data mismatch in a return calculation" lede="A calculation mixed adjusted close with unadjusted open. This created a false return pattern. A placebo test exposed the error, and the pattern disappeared after the loader was fixed." facts={[["Failure", "Incompatible price fields"], ["Detection", "Placebo and source trace"], ["Decision", "Invalidate and rerun"], ["Public detail", "Sanitized engineering sequence"]]} outline={outline}>
    <section className="case-section" id="question"><p className="section-index">01 · The question</p><h2>Determine whether the result came from the input data.</h2><p>The research screen produced a group of positive results. Related tests moved in the same direction, and changing the test settings did not remove the pattern.</p><p>The next step was to audit the inputs and run a test with no plausible research mechanism.</p></section>
    <section className="case-section" id="belief"><p className="section-index">02 · Initial result</p><h2>The same pattern appeared across related tests.</h2><p>The initial output was consistent with a repeatable effect, but it had not passed a placebo or an input audit.</p><p>I treated it as a result to validate, not as evidence ready for further research.</p></section>
    <section className="case-section" id="falsifier"><p className="section-index">03 · Invalidation criteria</p><h2>Conditions that would invalidate the output</h2><ul><li>A placebo with no plausible mechanism produced the same pattern.</li><li>The calculation mixed fields with different adjustment conventions.</li><li>Rerunning the analysis on consistent fields removed the effect.</li></ul><p>Any one of these conditions was enough to reject the output.</p></section>
    <section className="case-section" id="check"><p className="section-index">04 · Placebo and loader audit</p><h2>The placebo produced a similar pattern.</h2><p>I added a test with no research mechanism behind it. Its output resembled the original result.</p><p>The loader audit found that adjusted close and unadjusted open had entered the same calculation. Corporate-action adjustments affected one field but not the other, which created a mechanical change that looked like a return.</p><figure className="comparison-figure"><FigureCaption>Data path before and after the correction</FigureCaption><div className="comparison-columns"><div className="comparison-column"><span>Before</span><h3>Mixed conventions</h3><div className="data-line is-bad"><span>Field A</span><strong>Adjusted history</strong></div><div className="data-line is-bad"><span>Field B</span><strong>Unadjusted history</strong></div><div className="data-line is-bad"><span>Output</span><strong>Plausible number, invalid comparison</strong></div></div><div className="comparison-column"><span>After</span><h3>One source surface</h3><div className="data-line is-good"><span>Field A</span><strong>Same-source history</strong></div><div className="data-line is-good"><span>Field B</span><strong>Same-source history</strong></div><div className="data-line is-good"><span>Output</span><strong>Compatible calculation or refusal</strong></div></div></div></figure></section>
    <section className="case-section" id="failure"><p className="section-index">05 · Affected output</p><h2>All output from the calculation was invalidated.</h2><p>Positive and negative results from the same calculation were removed from the candidate pool because the defect could distort the value in either direction.</p><p>Downstream work that depended on those results was also stopped.</p></section>
    <section className="case-section" id="correction"><p className="section-index">06 · Loader change and rerun</p><h2>The loader now requires compatible fields from one source.</h2><p>When that pairing is unavailable, the loader returns no value. The original analysis was rerun with compatible fields, and the pattern did not survive.</p><div className="correction-record"><strong>Database record</strong><p>The original output remains in project history with its rejected status and the reason for rejection.</p></div></section>
    <section className="case-section" id="current"><p className="section-index">07 · Conclusion</p><h2>The original pattern came from incompatible inputs.</h2><p>The corrected run did not recover the result, so it did not move into forward testing.</p><p>The loader now checks field compatibility, and similar analyses can include the same placebo before receiving more work.</p></section>
    <section className="case-section" id="private"><p className="section-index">08 · Private details</p><h2>Information omitted from this case</h2><p>The instruments, strategy family, parameters, measured returns, candidate counts, source provider, and artifact paths are not published.</p><p>The public result is limited to the engineering finding: an incompatible data join created an artificial pattern, and the corrected loader prevented it from entering downstream evidence.</p><p><a className="text-link" href="/work/">Return to selected work</a></p></section>
  </CaseShell>
}

function NarrowedCasePage() {
  const outline = [['claim', 'Original claim'], ['reproduction', 'Reproduction'], ['robustness', 'Timing robustness'], ['decision', 'Result'], ['lesson', 'Implementation']]
  return <CaseShell page="narrowedCase" title="Reproduction passed; timing robustness failed" lede="An exact rerun matched the original output. A second test shifted the observation timing and invalidated one part of the claim." facts={[["First test", "Exact reproduction passed"], ["Second test", "Timing robustness failed"], ["Decision", "Narrow the claim"], ["Evidence", "Private"]]} outline={outline}>
    <section className="case-section" id="claim"><p className="section-index">01 · Original claim</p><h2>The claim contained two parts.</h2><p>One part described behavior under ordinary conditions. The second said the same behavior held under a more difficult condition.</p><p>Both parts required separate validation.</p></section>
    <section className="case-section" id="reproduction"><p className="section-index">02 · Reproduction</p><h2>The rerun matched the original output.</h2><p>The first test rebuilt the result from pinned code and data. The matching output confirmed that the calculation was deterministic and reproducible from the recorded inputs.</p><p>This test did not measure sensitivity to observation timing or sample choice.</p></section>
    <section className="case-section" id="robustness"><p className="section-index">03 · Timing robustness</p><h2>One part failed after the observation time changed.</h2><p>The second test shifted the observation timing while keeping the test rules fixed. The ordinary-condition result stayed in the same direction. The difficult-condition result did not.</p><p>The combined claim was therefore marked as failed.</p></section>
    <section className="case-section" id="decision"><p className="section-index">04 · Result</p><h2>Only the ordinary-condition claim remained.</h2><p>The surviving part became a narrower claim that still required more evidence. The failed part remained rejected and could only be reconsidered with new forward evidence.</p><div className="correction-record"><strong>Separate test results</strong><p>Reproduction established that the recorded code and data produced the same output. The timing test measured whether the result depended on one observation choice.</p></div></section>
    <section className="case-section" id="lesson"><p className="section-index">05 · Implementation</p><h2>Reproduction and scientific outcome are stored separately.</h2><p>The first test passed and the second failed. Storing both results separately prevented the reproduction result from overriding the failed robustness result.</p><p>This public summary omits the strategy, parameters, measured results, and evidence.</p><p><a className="text-link" href="/work/">Return to selected work</a></p></section>
  </CaseShell>
}

function NotesPage() {
  return <Shell page="notes" section="notes"><main id="main"><section className="page-hero shell"><div className="page-hero-grid"><div className="page-hero-copy"><p className="eyebrow">Notes</p><h1>Engineering notes</h1><p>Notes on permissions, mission state, evidence validation, recovery, and point-in-time data. These pages are written from project records, not published from system logs.</p></div><aside className="page-hero-aside"><p>Scope</p><strong>Design and implementation</strong><p>Private research state is excluded</p></aside></div></section><section className="notes-index shell"><div className="note-list"><a className="note-row" href="/notes/safe-refusal/"><time dateTime="2026-07">July 2026</time><div><h2>Handling a task without model permission</h2><p>Execution, safety, and operator-action fields for a refused task.</p></div><span>7 min ↗</span></a></div></section></main></Shell>
}

function RefusalNotePage() {
  return <Shell page="refusalNote" section="notes" progress><main id="main"><header className="article-hero shell"><div className="article-hero-grid"><div className="article-hero-copy"><p className="eyebrow">Engineering note · July 2026</p><h1>Handling a task without model permission</h1><p>When model access has not been approved, the router refuses the task and leaves the mission paused. Execution is recorded as refused and safety as passed.</p></div><aside className="article-hero-aside"><p>Reading time</p><strong>7 minutes</strong><p>Permissions and run status</p></aside></div></header><article className="article-body"><div className="article-layout"><aside className="article-margin is-sticky"><strong>System behavior</strong>Model access is opt-in for every invocation. The mission remains available when access is absent.</aside><div className="article-copy"><p>One research capability uses a model to retrieve public sources. That capability is not available merely because a task would benefit from it. The operator must create the mission with a read-only permission level and explicitly allow model use for that invocation.</p><p>If consent is absent, the router does not dispatch the task. It records the task as waiting for model access and records the attempted execution as refused. The safety result is a pass because the permission check behaved correctly.</p><p>The mission does not need to be recreated. Its tasks, budget, evidence, and history remain in SQLite. The operator can inspect what is waiting and resume the same mission after providing consent.</p><div className="article-pull">The refusal is stored as several status fields, not one generic failure.</div><h2>Recorded results</h2><p>The run records three separate results:</p><ol><li>The requested work did not execute.</li><li>The permission check behaved correctly.</li><li>The research question remains unanswered.</li></ol><p>Execution, safety, scientific result, diagnostic value, and required operator action are stored separately.</p><h2>Completed tasks use the same fields</h2><p>A local program can run without errors and still refute the claim it was testing. Execution succeeded and the scientific result was negative.</p><p>A source-retrieval task can execute successfully, pass its safety checks, and return valid citations while leaving the scientific question unresolved. Finding a source does not show that it supports the hypothesis.</p><h2>Operator interface</h2><p>A safe refusal should explain which permission was missing, whether other work can continue, and what approval would let the task resume.</p><p>A negative scientific result should show which claim became weaker and what work follows.</p><p>The interface needs to identify which field failed and what action is available.</p><p><a className="text-link" href="/notes/">Return to engineering notes</a></p></div><aside className="article-margin"><strong>Public boundary</strong>Capability names, source results, mission identifiers, budgets, and private evidence are omitted.</aside></div></article></main></Shell>
}

function AboutPage() {
  const scope = [['Data', 'Acquisition, validation, point-in-time records, and source contracts'], ['Research', 'Mission planning, task dependencies, evidence checks, and hypothesis state'], ['Backend', 'SQLite event history, capability routing, concurrency locks, and crash recovery'], ['Policy', 'Permission levels, promotion checks, typed refusals, and explicit operator decisions'], ['Interface', 'Native SwiftUI operator app and public React site'], ['Verification', 'Hermetic mission tests, data checks, and contract self-tests']]
  return <Shell page="about" section="about"><main id="main"><section className="about-hero shell"><div className="about-hero-grid"><div className="about-hero-copy"><p className="eyebrow">About</p><h1>Max McCollom</h1><p>I study financial economics at Columbia University. I started Katabasis in June 2026 and built the research pipeline, database, policy checks, tests, macOS app, and public site.</p></div><aside className="about-hero-aside"><p>Area of work</p><strong>Research engineering</strong><p>Applied AI, quantitative systems, and infrastructure</p></aside></div></section><section className="about-scope"><div className="shell about-grid"><div><p className="eyebrow">Project scope</p><h2>Components and responsibilities</h2></div><div className="about-grid-copy"><p>Most of the research system is Python. Mission state and evidence live in SQLite. The macOS operator app is SwiftUI. The public site is React. Two small OCaml programs enforce policy boundaries where a compact, typed checker is useful.</p><div className="scope-list">{scope.map(([label, copy]) => <div className="scope-row" key={label}><span>{label}</span><strong>{copy}</strong></div>)}</div></div></div></section><section className="about-difficult"><div className="shell about-difficult-grid"><div><p className="eyebrow">Engineering problems</p><h2>Permissions, evidence, and recovery</h2></div><div><p>The main implementation problems were limiting model access, converting source material into structured evidence, separating task status from research outcome, and storing enough state to resume an interrupted run.</p><p>The research director is read-only and has no path to live execution. Permission changes require an operator action.</p><p>I am interested in research engineering, applied AI, quantitative systems, and infrastructure roles.</p><div className="about-links"><a href="https://github.com/7rst2rvjs8-bot/katabasis" target="_blank" rel="noreferrer">Public repository ↗</a></div></div></div></section></main></Shell>
}

function ArchivePage() {
  return <Shell page="archive" section="archive"><main className="archive-page" id="main"><div className="shell archive-grid"><div className="archive-copy"><p className="eyebrow">Archive</p><h1>Earlier visual research</h1><p>Before the current public site, Katabasis was presented as an interactive 3D environment. That work remains available as a record of the project&apos;s visual development. It is no longer the primary explanation of the system.</p><p><a className="text-link" href="/estate/">Open the 3D archive</a></p></div><div className="archive-mark" aria-hidden="true" /></div></main></Shell>
}

function NotFoundPage() {
  return <Shell page="notFound" section=""><main className="archive-page" id="main"><div className="shell archive-grid"><div className="archive-copy"><p className="eyebrow">404</p><h1>Page not found</h1><p>The requested page does not exist.</p><p><a className="text-link" href="/">Return home</a></p></div></div></main></Shell>
}

export default function PublicSite() {
  const route = routeForPath(window.location.pathname)
  const pages = { home: HomePage, system: SystemPage, work: WorkPage, dataCase: DataCasePage, narrowedCase: NarrowedCasePage, notes: NotesPage, refusalNote: RefusalNotePage, about: AboutPage, archive: ArchivePage, notFound: NotFoundPage }
  const Page = pages[route.page]
  return <Page />
}
