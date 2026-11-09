import { lazy, Suspense, useEffect, useState } from 'react'
import { researchCases } from './research.js'
import { systemGroups, systemPages } from './systems.js'
import ResearchExhibit, { ProcessDiagram, ObservationDiagram } from './ResearchExhibit.jsx'
import SystemMap from './SystemMap.jsx'
import { subsystemExhibit } from './exhibits.js'
import { subsystemPath } from './navigation.js'
import { readAuthConfiguration } from './access/authConfiguration.js'
import './site.css'

const PrivateAccess = lazy(() => import('./access/PrivateAccess.jsx'))
const researchAccessEnabled = Boolean(readAuthConfiguration())

const linkedin = 'https://www.linkedin.com/in/max-mccollom-448bbb367/'
const source = 'https://github.com/Max-McCollom/katabasis'
const originalMark = '/media/katabasis-original.png'

const overviewFlow = [
  { id: 'financial-hypotheses', slug: 'hypothesis-discovery', label: 'Define the financial question', description: 'Specify the mechanism, competing explanations and evidence required.' },
  { id: 'data-sources', slug: 'data-factory', label: 'Prepare usable observations', description: 'Check timing, field meaning and whether the data measures the intended quantity.' },
  { id: 'historical-analysis', slug: 'simulation-replay', label: 'Compare and replay', description: 'Retain the baseline and examine changes in assumptions or portfolio rules.' },
  { id: 'evidence-workflow', slug: 'evidence-evaluation', label: 'Evaluate the claim', description: 'Consider costs, dependence, selection and sensitivity before interpreting a result.' },
  { id: 'portfolio-research', slug: 'portfolio-research', label: 'Assess portfolio implications', description: 'Connect product and risk-control comparisons to an explicit objective.' },
  { id: 'interfaces-controls', slug: 'operator-console', label: 'Review the decision', description: 'Make the evidence, unresolved questions and required human actions visible.' },
]
const featuredSubsystemIds = ['data-factory', 'hypothesis-discovery', 'simulation-replay', 'portfolio-research', 'research-executive', 'operator-console']

const routes = {
  '/': ['home', 'Katabasis | Markets Research by Max McCollom', 'Independent markets and investment research by Max McCollom, Financial Economics at Columbia University. Portfolio studies, financial hypotheses and evidence review.'],
  '/system/components': ['components', 'Research Subsystems | Katabasis', 'Explore the actual data, discovery, observation, simulation, portfolio and research-operations components behind Katabasis.'],
  '/system': ['system', 'Research & System Design | Katabasis', 'The research decisions and connected subsystems behind Katabasis, from market data and financial hypotheses to portfolio analysis and evidence review.'],
  '/work': ['work', 'Selected Markets Research | Katabasis', 'Portfolio risk controls, an eight-ETF comparison and a data-integrity investigation. Selected independent research by Max McCollom.'],
  '/about': ['about', 'Max McCollom | Columbia Financial Economics', 'Financial Economics at Columbia University, planned Mathematics minor, expected May 2029. Creator of Katabasis since April 2026.'],
  '/notes': ['notes', 'Research Notes | Katabasis', 'Notes on research design, reproducibility and evidence from the Katabasis project.'],
  '/notes/safe-refusal': ['refusal', 'Research Permissions | Katabasis', 'How the research workflow distinguishes execution, research outcomes and operator permissions.'],
  '/work/narrowed-claim': ['robustness', 'Reproduction & Robustness | Katabasis', 'A research case about separating an exact reproduction from robustness to an observation choice.'],
  '/credits': ['credits', 'Image Credits | Katabasis', 'Sources for the institutional identity images used on this site.'],
  '/research-access': ['access', 'Research Access | Katabasis', 'Sign in or request owner-approved access to private Katabasis research.'],
}

function currentRoute() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const subsystem = systemPages.find(item => subsystemPath(item).replace(/\/$/, '') === path || '/system/' + item.id === path)
  if (subsystem) return { page: 'subsystem', subsystem, title: subsystem.title + ' | Katabasis', description: subsystem.deck, canonical: subsystemPath(subsystem) }
  const study = researchCases.find(item => '/work/' + item.id === path)
  return study ? { page: 'case', study, title: study.title + ' | Katabasis', description: study.summary } :
    routes[path] ? { page: routes[path][0], title: routes[path][1], description: routes[path][2] } :
      { page: '404', title: 'Page Not Found | Katabasis', description: 'Return to Katabasis markets research.' }
}

function Mark({ full = false }) {
  return <span className={full ? 'project-mark' : 'brand-mark brand-symbol'}>
    <img src={originalMark} alt={full ? 'Original Katabasis gold descending K and wordmark' : ''} width="1254" height="1254" loading={full ? 'lazy' : 'eager'} />
  </span>
}

function Header({ page }) {
  const section = ['components', 'subsystem'].includes(page) ? 'system' : page === 'case' ? 'work' : ['refusal', 'robustness'].includes(page) ? 'notes' : page
  const links = [
    { page: 'work', href: '/work/', label: 'Research' },
    { page: 'system', href: '/system/', label: 'System' },
    { page: 'notes', href: '/notes/', label: 'Notes' },
    { page: 'about', href: '/about/', label: 'About' },
    ...(researchAccessEnabled ? [{ page: 'access', href: '/research-access/', label: 'Research access' }] : []),
  ]
  return <header className="site-header"><div className="shell header-inner">
    <a href="/" className="wordmark" aria-label="Katabasis home" aria-current={page === 'home' ? 'page' : undefined}><Mark /><span className="brand-name">Katabasis</span></a>
    <nav className="site-nav" aria-label="Primary navigation">
      {links.map(link => <a href={link.href} key={link.page} aria-current={section === link.page ? (page === link.page ? 'page' : 'location') : undefined}>{link.label}</a>)}
      <a className="nav-contact" href={linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
    </nav>
  </div></header>
}

function Footer() {
  return <footer className="site-footer"><div className="shell footer-inner">
    <div className="footer-brand"><a href="/">Katabasis</a><p>Independent markets research by Max McCollom.</p></div>
    <nav className="footer-links" aria-label="Resources"><a href="/system/components/">Subsystem directory</a><a href="/research/katabasis-overview.pdf">Research overview PDF</a>{researchAccessEnabled && <a href="/research-access/">Research access</a>}<a href={source} target="_blank" rel="noreferrer">Website source</a><a href={linkedin} target="_blank" rel="noreferrer">LinkedIn</a></nav>
    <div className="footer-meta"><span>April 2026–present · New York</span><a href="/credits/">Image credits</a></div>
  </div></footer>
}

function Shell({ route, children }) {
  useEffect(() => {
    document.title = route.title
    if (route.canonical && window.location.pathname !== route.canonical) window.history.replaceState(null, '', route.canonical + window.location.search + window.location.hash)
    if (route.canonical) document.querySelector('link[rel="canonical"]')?.setAttribute('href', 'https://katabasis.rip' + route.canonical)
    document.documentElement.classList.add('public-site-route')
    document.body.classList.add('public-site-route')
    document.querySelector('meta[name="description"]')?.setAttribute('content', route.description)
    return () => { document.documentElement.classList.remove('public-site-route'); document.body.classList.remove('public-site-route') }
  }, [route.title, route.description, route.canonical])
  return <><a className="skip-link" href={['system', 'components', 'subsystem'].includes(route.page) ? '#system-content' : '#main'}>Skip to content</a><Header page={route.page} />{['system', 'components', 'subsystem'].includes(route.page) && <SystemSectionNav page={route.page} />}<main id="main" tabIndex="-1">{children}</main><Footer /></>
}

function Breadcrumbs({ items }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><ol>
    <li><a href="/">Home</a></li>{items.map(item => <li key={item.label}>{item.href ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}</li>)}
  </ol></nav>
}

function PageToc({ items, system = false }) {
  const links = <ul>{items.map(item => <li key={item.id}><a href={'#' + item.id}>{item.label}</a></li>)}</ul>
  return <><aside className={'page-toc case-sidebar' + (system ? ' system-contents' : '')}><nav aria-label="On this page"><h2>On this page</h2>{links}</nav></aside>
    <details className="page-toc-mobile"><summary>On this page</summary><nav aria-label="On this page">{links}</nav></details></>
}

function ResearchTable({ id, caption, headers, rows, note }) {
  return <><div className="table-wrap case-table-wrap" role="region" aria-labelledby={id + '-caption'} tabIndex="0"><table className="research-table">
    <caption id={id + '-caption'}>{caption}</caption>
    <thead><tr>{headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
  </table></div>{note && <p className="table-note">{note}</p>}</>
}

function ResearchRows({ headingLevel = 3, limit } = {}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return <div className="research-list">{researchCases.slice(0, limit).map(study => <article className="research-row" key={study.id}>
    <p className="research-category">{study.category}</p>
    <div className="research-copy"><Heading><a href={'/work/' + study.id + '/'}>{study.title}</a></Heading><p className="research-question">{study.question}</p></div>
    <dl className="research-facts"><div><dt>Key decision</dt><dd>{study.keyDecision}</dd></div><div><dt>Scope</dt><dd>{study.scope}</dd></div></dl>
  </article>)}</div>
}

function Ownership() {
  return <section className="ownership split-section shell section-block" aria-labelledby="contribution-title"><div><h2 id="contribution-title">Research direction and design</h2><p>I choose the financial questions, methods and data; specify how the components work together; and evaluate what the findings support.</p></div><div className="ownership-copy"><p>AI generates the software implementation from my specifications. My work centers on research judgment, system design and the decisions that follow from the evidence.</p><a className="text-link" href="/system/">Inspect the system and design choices</a></div></section>
}

function Home({ route }) {
  return <Shell route={route}>
    <section className="home-intro shell" aria-labelledby="project-title"><div className="intro-copy"><p className="section-label">Independent markets & investment research</p><h1 id="project-title">Katabasis</h1><p className="page-lede">Independent research by Max McCollom, Financial Economics at Columbia University.</p><p>Katabasis connects financial hypotheses, market data, historical comparisons and portfolio research. I define the questions and methods, design the system and interpret the findings.</p><p className="intro-meta">April 2026–present · New York</p><div className="intro-actions"><a className="button" href="/work/">Explore the research</a><a className="text-link" href="/system/">System and design</a></div></div>
      <aside className="intro-finding" aria-labelledby="selected-finding-title"><p className="section-label">From the portfolio-control study</p><h2 id="selected-finding-title">Protection, participation and trading costs</h2><p>Compared 26 configurations under three transaction-cost assumptions, examining growth, drawdown, tracking and turnover.</p><p className="finding-copy"><strong>Selected finding.</strong> A rebalancing band met the study's historical tracking and turnover criteria.</p><p className="limitation">Historical simulation with simplified prices, cash returns and execution. Findings do not establish future performance.</p><a className="text-link" href="/work/portfolio-controls/">Inspect the comparison</a></aside>
    </section>
    <section className="research-section shell section-block" aria-labelledby="home-research-title"><div className="section-heading"><div><h2 id="home-research-title">Selected studies</h2><p>Financial questions, research choices and the decisions that followed.</p></div><a className="text-link" href="/work/">All research</a></div><ResearchRows limit={3} /></section>
    <section className="system-overview shell section-block" aria-labelledby="system-overview-title"><div className="section-heading"><div><h2 id="system-overview-title">Research infrastructure and analysis</h2><p>Explore the actual components that connect market evidence, analysis, portfolio research and human review.</p></div><a className="text-link" href="/system/">Explore the system</a></div><ul className="layer-directory">{featuredSubsystemIds.map(id => systemPages.find(item => item.id === id)).filter(Boolean).map(item => <li key={item.id}><a href={subsystemPath(item)}>{item.title}</a><p>{item.deck}</p></li>)}</ul></section>
    <Ownership />
    <section className="about-preview split-section shell section-block"><div><h2>Operating analysis and energy research</h2><p>My work at Ridgewood Water combined analysis in Excel with responsibility for municipal operating systems. My academic research includes energy cost and grid reliability.</p></div><div><p>I am seeking internships in markets and investment research, portfolio risk, and energy or commodities analysis. New York is my first choice.</p><a className="text-link" href="/about/">Background and experience</a></div></section>
  </Shell>
}

function Work({ route }) {
  return <Shell route={route}><header className="page-heading shell"><Breadcrumbs items={[{ label: 'Research' }]} /><h1>Selected research</h1><p className="page-lede">Portfolio analysis, hypothesis design and the reliability of market evidence.</p><p>Each study explains the question, the comparison, the design choices and the limits of the conclusion.</p></header><section className="shell work-rows" aria-label="Research studies"><ResearchRows headingLevel={2} /></section><Ownership /></Shell>
}

function Case({ route }) {
  const study = route.study
  const toc = [{ id: 'finding', label: 'Finding and limits' }, { id: 'output', label: 'Research output' }, { id: 'question', label: 'Research question' }, { id: 'comparison', label: 'The comparison' }, { id: 'design', label: 'Design decisions' }, { id: 'record', label: 'Recorded work' }, { id: 'subsystems', label: 'Related subsystems' }, { id: 'interpretation', label: 'What the work demonstrates' }]
  const related = researchCases.filter(item => item.id !== study.id)
  return <Shell route={route}><article><header className="case-heading page-heading shell"><Breadcrumbs items={[{ label: 'Research', href: '/work/' }, { label: study.title }]} /><p className="section-label">{study.category} · Independent study</p><h1>{study.title}</h1><p className="page-lede">{study.summary}</p><p className="article-byline">Research design and evaluation by Max McCollom</p><ul className="tag-list" aria-label="Research topics">{study.tags.map(tag => <li key={tag}>{tag}</li>)}</ul></header>
      <div className="article-layout case-layout shell"><PageToc items={toc} /><div className="article-body case-body">
        <section id="finding" className="finding" aria-labelledby="finding-title" tabIndex="-1"><h2 id="finding-title">Finding and limits</h2><p className="finding-copy">{study.decision}</p><p className="limitation"><strong>Limitation.</strong> {study.limitation}</p></section>
        <section id="output" tabIndex="-1" aria-labelledby="output-title"><h2 id="output-title">Research output</h2><ResearchExhibit exhibitId={study.id} instance="case" /></section>
        <section id="question" aria-labelledby="question-title" tabIndex="-1"><h2 id="question-title">The financial question</h2><p className="case-question">{study.question}</p><dl className="study-scope"><div><dt>Study scope</dt><dd>{study.scope}</dd></div></dl></section>
        <section id="comparison" aria-labelledby="comparison-title" tabIndex="-1"><h2 id="comparison-title">{study.comparison.heading}</h2><ResearchTable id={study.id + '-comparison'} {...study.comparison} /></section>
        <section id="design" aria-labelledby="design-title" tabIndex="-1"><h2 id="design-title">Why the study was designed this way</h2><ResearchTable id={study.id + '-design'} caption="Research decisions and their rationale" headers={['Decision', 'What I specified', 'Why it matters']} rows={study.steps.map(step => [step.title, step.body, step.rationale])} /></section>
        {study.record && <section id="record" aria-labelledby="record-title" tabIndex="-1"><h2 id="record-title">The recorded research decision</h2><div className="evidence-record"><p className="section-label">{study.record.kind}</p>{study.record.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<p className="record-meta">{study.record.sourceLabel}</p></div></section>}
        <section id="subsystems" aria-labelledby="subsystems-title" tabIndex="-1"><h2 id="subsystems-title">The system behind this study</h2><ul className="linked-system-list">{(study.systems || []).map(id => systemPages.find(item => item.id === id)).filter(Boolean).map(item => <li key={item.id}><a href={subsystemPath(item)}>{item.title}</a><p>{item.deck}</p></li>)}</ul></section>
        <section id="interpretation" aria-labelledby="interpretation-title" tabIndex="-1"><h2 id="interpretation-title">What this work demonstrates</h2><p>{study.relevance}</p><a className="text-link" href="/system/">See the connected research process</a></section>
        <nav className="related-links" aria-label="Related research"><h2>Other studies</h2><ul>{related.map(item => <li key={item.id}><a href={'/work/' + item.id + '/'}>{item.title}</a></li>)}</ul><a href="/work/">Return to all research</a></nav>
      </div></div></article></Shell>
}

function SystemSectionNav({ page }) {
  return <nav className="section-nav shell" aria-label="System navigation"><a href="/system/" aria-current={page === 'system' ? 'page' : undefined}>Overview</a><a href="/system/components/" aria-current={page === 'components' ? 'page' : page === 'subsystem' ? 'location' : undefined}>Subsystems</a><a href="/work/">Research studies</a></nav>
}

function SubsystemNav({ active }) {
  const contents = <>{systemGroups.map(group => <div className="subsystem-nav-group" key={group.id}><h3>{group.title}</h3><ul>{systemPages.filter(item => item.group === group.id).map(item => <li key={item.id}><a href={subsystemPath(item)} aria-current={active === item.id ? 'page' : undefined}>{item.title}</a></li>)}</ul></div>)}</>
  return <><aside className="subsystem-sidebar"><nav aria-label="Explore subsystems"><h2>Explore the system</h2><a className="subsystem-overview-link" href="/system/">System overview</a>{contents}</nav></aside><details className="subsystem-nav-mobile"><summary>Explore subsystems</summary><nav aria-label="Explore subsystems">{contents}</nav></details></>
}

function System({ route }) {
  const studyIds = ['portfolio-controls', 'hypothesis-design', 'data-mismatch', 'narrowed-claim']
  const studies = studyIds.map(id => researchCases.find(item => item.id === id)).filter(Boolean)
  return <Shell route={route}><div className="dossier-layout shell"><SubsystemNav /><article className="dossier-body" id="system-content" tabIndex="-1"><header className="dossier-heading"><Breadcrumbs items={[{ label: 'System' }]} /><p className="section-label">The Katabasis research system</p><h1>Research system architecture</h1><p className="page-lede">Data infrastructure, discovery, simulation, evidence evaluation, portfolio research and the tools that keep the work reviewable.</p><p>I designed Katabasis as a connected research process. Its components preserve what was observed, what was assumed, what was tested and why a conclusion changed.</p><a className="text-link" href="/system/components/">Browse all subsystem guides</a></header>
    <section className="dossier-section" aria-label="System architecture"><SystemMap /><details className="research-sequence"><summary>View the research sequence</summary><ol className="system-flow">{overviewFlow.map(step => { const target = systemPages.find(item => item.id === step.slug); return <li id={step.id} key={step.id}><a href={target ? subsystemPath(target) : '/system/'}>{step.label}</a><p>{step.description}</p></li> })}</ol></details></section>
    <section className="dossier-section" aria-labelledby="scope-title"><h2 id="scope-title">Component scope and implementation</h2><div className="system-group-summary">{systemGroups.map(group => <section key={group.id}><h3><a href={'/system/components/#' + group.id}>{group.title}</a></h3><p>{group.description || systemPages.filter(item => item.group === group.id).map(item => item.title).join(', ') + '.'}</p></section>)}</div><p>The guides group related components by the work they support. They include implemented research tools, recorded studies, diagnostics and development foundations. Each guide explains its own stage and documented output.</p></section>
    <section className="dossier-section" aria-labelledby="decisions-title"><h2 id="decisions-title">Selected findings and design revisions</h2><ResearchTable id="system-decisions" caption="Selected studies and recorded decisions" headers={['Research record', 'Finding or design decision']} rows={studies.map(item => [<a href={'/work/' + item.id + '/'}>{item.title}</a>, item.keyDecision])} /><p className="table-note">These are selected research conclusions and design revisions. The full cases explain their scope and limits.</p></section>
    <section className="dossier-section" aria-labelledby="ownership-system-title"><h2 id="ownership-system-title">My role in the system</h2><p>I set the financial questions, choose methods and data requirements, design the functional relationships and evaluation criteria, and interpret the findings. AI generates the implementation code from my specifications.</p><p>The subsystem guides connect those choices to concrete components and recorded work. The public website presents research and system design; it does not connect to private operating state.</p></section>
    <nav className="dossier-next" aria-label="Continue exploring"><a href="/system/components/">Explore the subsystem directory</a><a href="/work/">Read the research cases</a></nav>
  </article></div></Shell>
}

function Components({ route }) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const visible = systemPages.filter(item => [item.title, item.deck, item.purpose, ...item.components.map(component => component.name + ' ' + component.role)].join(' ').toLowerCase().includes(needle))
  return <Shell route={route}><div className="dossier-layout shell"><SubsystemNav /><article className="dossier-body" id="system-content" tabIndex="-1"><header className="dossier-heading"><Breadcrumbs items={[{ label: 'System', href: '/system/' }, { label: 'Subsystems' }]} /><h1>Research subsystems</h1><p className="page-lede">Explore the actual component families behind Katabasis, their design decisions and the work recorded so far.</p><p>Choose an area directly, or find a component by its name or research purpose.</p></header><div className="directory-search"><label htmlFor="subsystem-search">Find a subsystem</label><div><input id="subsystem-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, purpose or component" />{query && <button type="button" onClick={() => setQuery('')}>Clear search</button>}</div><p role="status">{visible.length} {visible.length === 1 ? 'guide' : 'guides'}{needle ? ' matching “' + query + '”' : ' across the research system'}</p></div>
    <div className="system-directory">{systemGroups.map(group => { const items = visible.filter(item => item.group === group.id); return items.length ? <section id={group.id} key={group.id} tabIndex="-1"><h2>{group.title}</h2>{items.map(item => <article className="system-directory-row" key={item.id}><h3><a href={subsystemPath(item)}>{item.title}</a></h3><p>{item.deck}</p><p className="component-state"><strong>Documented scope.</strong> {item.stage}</p><p className="result-preview"><strong>In the record.</strong> {item.record.title}</p></article>)}</section> : null })}{!visible.length && <div className="directory-empty"><h2>No matching subsystem</h2><p>Try a research function such as data, replay, portfolio, evidence or orchestration.</p><button type="button" onClick={() => setQuery('')}>Show all subsystems</button></div>}</div>
  </article></div></Shell>
}

function Subsystem({ route }) {
  const item = route.subsystem
  const group = systemGroups.find(group => group.id === item.group)
  const index = systemPages.findIndex(page => page.id === item.id)
  const previous = systemPages[index - 1], next = systemPages[index + 1]
  const connections = item.connections.map(connection => ({ ...connection, target: systemPages.find(page => page.id === connection.id) })).filter(connection => connection.target)
  return <Shell route={route}><div className="dossier-layout shell"><SubsystemNav active={item.id} /><article className="dossier-body" id="system-content" tabIndex="-1"><header className="dossier-heading"><Breadcrumbs items={[{ label: 'System', href: '/system/' }, { label: 'Subsystems', href: '/system/components/' }, { label: item.title }]} /><p className="section-label">{group?.title}</p><h1>{item.title}</h1><p className="page-lede">{item.deck}</p><p className="record-meta">Project source review · November 2026</p><nav className="content-jumps" aria-label="On this page"><a href="#output">Research output</a><a href="#purpose">Research design</a><a href="#components">Components</a><a href="#design">Design decisions</a><a href="#record">Recorded work</a><a href="#connections">Connections</a></nav></header>
    <section id="output" className="dossier-section" tabIndex="-1" aria-labelledby="output-title"><h2 id="output-title">Documented research outputs</h2>{(subsystemExhibit[item.id] || []).map(key => <ResearchExhibit key={key} exhibitId={key} instance={item.id} />)}</section>
    <section id="purpose" className="dossier-section" tabIndex="-1"><h2>Research purpose and design</h2><p>{item.purpose}</p><ProcessDiagram steps={item.flow} title="Research procedure and information flow" />{['forward-observer', 'evidence-evaluation'].includes(item.id) && <ObservationDiagram />}</section>
    <section id="components" className="dossier-section" tabIndex="-1"><h2>Components and responsibilities</h2><ResearchTable id={item.id + '-components'} caption={item.title + ': component roles'} headers={['Component', 'Research role', 'Documented state']} rows={item.components.map(component => [component.name, component.role, component.state])} /><p className="readiness-note">{item.stage}</p></section>
    <section id="design" className="dossier-section" tabIndex="-1"><h2>Design decisions and their consequences</h2><div className="decision-records">{item.decisions.map(decision => <section className="decision-record" key={decision.decision}><h3>{decision.decision}</h3><dl><div><dt>Rationale</dt><dd>{decision.rationale}</dd></div><div><dt>Consequence for the research</dt><dd>{decision.consequence}</dd></div></dl></section>)}</div></section>
    <section id="record" className="dossier-section" tabIndex="-1"><h2>Research record and interpretation</h2><div className="evidence-record"><p className="section-label">{item.record.kind}</p><h3>{item.record.title}</h3>{item.record.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<p className="record-meta">{item.record.sourceLabel}</p></div><p className="limitation"><strong>Interpretation.</strong> {item.record.limitation}</p>{item.related.length > 0 && <nav className="linked-studies" aria-label="Related public work"><h3>Explore the related work</h3><ul>{item.related.map(link => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul></nav>}</section>
    <section id="connections" className="dossier-section" tabIndex="-1"><h2>Related research functions</h2><ul className="connection-list">{connections.map(connection => <li key={connection.id}><a href={subsystemPath(connection.target)}>{connection.label || connection.target.title}</a><p>{connection.reason}</p></li>)}</ul></section>
    <nav className="dossier-next" aria-label="Subsystem guide navigation">{previous ? <a href={subsystemPath(previous)}><span>Previous guide</span>{previous.title}</a> : <a href="/system/">System overview</a>}{next ? <a href={subsystemPath(next)}><span>Next guide</span>{next.title}</a> : <a href="/system/components/">All subsystem guides</a>}</nav>
  </article></div></Shell>
}

function About({ route }) {
  return <Shell route={route}><header className="page-heading shell about-heading"><div><Breadcrumbs items={[{ label: 'About' }]} /><h1>Max McCollom</h1><p className="page-lede">Financial Economics at Columbia University.<br />Mathematics minor planned. Expected May 2029.</p><p>I am interested in how economic ideas become useful investment and trading decisions. I created Katabasis in April 2026 to pursue that question through independent research and system design.</p><a className="text-link" href={linkedin} target="_blank" rel="noreferrer">Connect on LinkedIn</a></div><aside className="about-profile" aria-label="Portrait and education"><figure className="about-portrait"><img src="/media/max-mccollom-portrait.png" alt="Max McCollom" width="1254" height="1254" decoding="async" /></figure><div className="education-mark"><img src="/media/columbia-university-white.svg" alt="Columbia University" width="320" height="160" /><p>Financial Economics<br /><span>2026–2029 · New York</span></p></div></aside></header>
    <section className="project-panel shell section-block" aria-labelledby="about-project-title"><Mark full /><div className="project-panel-copy"><p className="section-label">Independent project · April 2026–present</p><h2 id="about-project-title">Katabasis</h2><p>I define the financial questions, methods, data choices, system structure and evaluation criteria for a connected markets research project. AI generates the software implementation from my specifications.</p><p>The work brings together portfolio studies, investment-product comparisons, data validation and a workflow that preserves evidence and reasons for revising a conclusion.</p><a className="text-link" href="/work/">Explore the research</a></div></section>
    <section className="experience-section shell section-block" aria-labelledby="experience-title"><div className="section-heading"><div><h2 id="experience-title">Experience and initiative</h2><p>Operating analysis and practical responsibility.</p></div></div><div className="experience-list">
      <article className="experience-row"><div className="org-symbol"><img src="/media/ridgewood-water-logo.png" alt="Ridgewood Water" width="110" height="110" loading="lazy" /></div><div><p className="section-label">October 2024–August 2026 · Ridgewood, NJ</p><h3>SCADA Systems Operator & Data Analyst</h3><h4>Ridgewood Water</h4><p>Analyzed operating data in Excel to identify pump-scheduling improvements with estimated annual electricity savings of $10,000+. Developed a procedure that maintained system pressure during a three-day facility outage and was adopted system-wide.</p><p className="supporting-copy">Worked with supervisory control and data acquisition systems for a municipal utility serving 60,000 residents across four municipalities.</p></div></article>
      <article className="experience-row"><div className="experience-kind">Community project</div><div><p className="section-label">2022–2024 · Independent service project</p><h3>Community Technology Access Project</h3><p>Led a team that built and donated 12 workstations to underserved youth. Coordinated procurement and assembly, then trained recipients in maintenance and troubleshooting.</p></div></article>
    </div></section>
    <section className="academic-section split-section shell section-block" aria-labelledby="energy-research-title"><div><h2 id="energy-research-title">Energy cost and reliability</h2><p className="section-label">Academic research · Fall 2024</p></div><div><p>In a 20-page academic paper, I compared nuclear, renewable and fossil-fuel power using levelized cost of energy, safety metrics and grid reliability.</p><p>This work, together with utility operations experience, informs my interest in energy and commodities markets.</p></div></section>
    <section className="contact-section shell section-block" aria-labelledby="interests-title"><h2 id="interests-title">Internship interests</h2><p>Markets and investment research, portfolio risk, and energy or commodities analysis.</p><p>New York is my first choice. I am also open to Chicago, San Francisco, Los Angeles, Dallas, Miami and international opportunities.</p><a className="text-link" href={linkedin} target="_blank" rel="noreferrer">Connect on LinkedIn</a></section>
  </Shell>
}

function Note({ route }) {
  const robustness = route.page === 'robustness'
  return <Shell route={route}><article className="note-article shell"><header className="page-heading"><Breadcrumbs items={[{ label: 'Notes', href: '/notes/' }, { label: robustness ? 'Reproduction and robustness' : 'Research permissions' }]} /><p className="section-label">Research design</p><h1>{robustness ? 'Reproduction and robustness answer different questions' : 'A completed task and a research result are separate outcomes'}</h1><p className="page-lede">{robustness ? 'An exact rerun reproduced a recorded result. Changing an observation choice weakened part of the claim.' : 'The research workflow records whether work ran, whether its permissions were satisfied and whether the evidence supports the question.'}</p></header>
    <section className="note-section"><h2>{robustness ? 'The research decision' : 'Why the distinction matters'}</h2><p>{robustness ? 'The claim contained more than one condition. Matching the original output established reproduction from the recorded inputs. A separate timing test did not support the full claim, so the conclusion was narrowed.' : 'A task can run correctly and return evidence against a hypothesis. A source can be retrieved successfully while leaving the question unresolved. A task can also be refused before dispatch because an approved permission is absent.'}</p></section>
    <section className="note-section"><h2>{robustness ? 'What the system needs to preserve' : 'The design choice'}</h2><p>{robustness ? 'The reproduction result and the robustness result are recorded independently, so one successful test cannot erase an unfavorable result from another.' : 'Execution, research outcome and required human action remain distinct. A paused research assignment retains its question, evidence and task history, and can be reviewed without treating an unanswered question as a completed finding.'}</p></section>
    <nav className="related-links" aria-label="Related project material"><a href="/system/">Research and system design</a><a href="/notes/">All research notes</a></nav></article></Shell>
}

function Notes({ route }) {
  return <Shell route={route}><header className="page-heading shell"><Breadcrumbs items={[{ label: 'Notes' }]} /><h1>Research notes</h1><p className="page-lede">Decisions behind the research workflow.</p><p>How the system distinguishes a calculation, a supported conclusion and permission to act.</p></header><section className="notes-list shell" aria-label="Research notes"><article className="note-row"><h2><a href="/work/narrowed-claim/">Reproduction and robustness answer different questions</a></h2><p>An exact rerun and a test of sensitivity to an observation choice are recorded independently.</p></article><article className="note-row"><h2><a href="/notes/safe-refusal/">A completed task and a research result are separate outcomes</a></h2><p>Execution, research outcomes and required human actions stay distinct in the research record.</p></article></section></Shell>
}

function Simple({ route }) {
  return <Shell route={route}><section className="page-heading shell simple-page"><h1>Page not found</h1><p className="page-lede">Explore the selected research or return to the home page.</p><a className="text-link" href="/">Return home</a></section></Shell>
}

function Access({ route }) {
  return <Shell route={route}><Suspense fallback={<section className="page-heading shell" role="status"><h1>Research access</h1><p>Loading account access.</p></section>}><PrivateAccess><p>The <a href="/work/">public research summaries</a> remain available without an account. Private materials are shared individually after owner review.</p></PrivateAccess></Suspense></Shell>
}

function Credits({ route }) {
  return <Shell route={route}><article className="page-heading shell credits-page"><Breadcrumbs items={[{ label: 'Image credits' }]} /><h1>Image credits</h1><div className="credits-list"><section><h2>Columbia University</h2><p>The complete University wordmark is from <a href="https://worldprojects.columbia.edu/sites/default/files/2023-12/columbia-university-logo-white.svg">Columbia World Projects</a>. It identifies my university in the education entry.</p></section><section><h2>Ridgewood Water</h2><p>The utility logo is reproduced from its <a href="https://water.ridgewoodnj.net/wp-content/uploads/2025/07/B2775-Ridgewood-water-dept-2025_REV6.pdf">official 2025 Annual Drinking Water Quality Report</a>. It identifies my former employer.</p></section><section><h2>Katabasis</h2><p>The gold descending K and Katabasis wordmark are the project's original identity. The header uses a crop of the original artwork; the complete artwork appears on the About page.</p></section></div></article></Shell>
}

export default function PublicSite() {
  const route = currentRoute()
  const pages = { home: Home, work: Work, case: Case, system: System, components: Components, subsystem: Subsystem, about: About, notes: Notes, refusal: Note, robustness: Note, credits: Credits, access: Access }
  const Page = pages[route.page] || Simple
  return <Page route={route} />
}
