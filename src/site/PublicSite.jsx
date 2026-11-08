import { useEffect } from 'react'
import { researchCases } from './research.js'
import './site.css'

const linkedin = 'https://www.linkedin.com/in/max-mccollom-448bbb367/'
const source = 'https://github.com/Max-McCollom/katabasis'
const originalMark = '/media/katabasis-original.png'

const layers = [
  { id: 'data-sources', name: 'Market data & sources', short: 'Know what the inputs mean.', purpose: 'Make the evidence comparable before drawing a financial conclusion.', design: 'I choose the data requirements and checks around source dates, corporate-action adjustments and history coverage.', output: 'Inputs whose source, timing and limitations can be inspected.', example: 'A placebo test exposed incompatible price adjustments in a return calculation.', href: '/work/data-mismatch/', linkLabel: 'Price-adjustment investigation' },
  { id: 'financial-hypotheses', name: 'Financial hypotheses', short: 'Explain the economic mechanism.', purpose: 'Turn a plausible market story into a question that can be investigated.', design: 'I specify the mechanism, counterparty incentives, market constraints and capacity considerations, then define what would weaken the claim.', output: 'A research specification with competing explanations and invalidation criteria.', example: 'The research framework asks who is on the other side of an opportunity and why the proposed effect could persist.' },
  { id: 'historical-analysis', name: 'Historical analysis', short: 'Test the question against evidence.', purpose: 'Compare a proposed relationship with alternatives and check how sensitive it is to the analysis choices.', design: 'I define comparisons, historical periods, cost assumptions and diagnostic tests. Controlled replay and recorded inputs support review.', output: 'Study results that distinguish an executed calculation from a supported conclusion.', example: 'Portfolio controls were compared on growth, drawdown, allocation tracking and turnover.', href: '/work/portfolio-controls/', linkLabel: 'Portfolio-control comparison' },
  { id: 'portfolio-research', name: 'Portfolio research', short: 'Connect the analysis to an objective.', purpose: 'Understand how an investment choice changes portfolio behavior.', design: 'I compare products by their role and evaluate controls against explicit objectives for risk, participation and the cost of trading.', output: 'Comparisons with the trade-offs and history limitations stated.', example: 'An eight-ETF comparison separates cash-management, dividend-equity and option-income roles.', href: '/work/etf-comparison/', linkLabel: 'Eight-fund ETF comparison' },
  { id: 'evidence-workflow', name: 'Evidence & research workflow', short: 'Keep the reasoning inspectable.', purpose: 'Preserve the path from the original question to the current conclusion.', design: 'I designed the workflow around mission questions, dependent tasks, source records, hypothesis updates and reasons for changing a plan.', output: 'Research records that retain unresolved questions and the evidence behind revisions.', example: 'Source research, local analysis and synthesis can contribute different kinds of evidence to the same question.', href: '/work/narrowed-claim/', linkLabel: 'Reproduction and robustness note' },
  { id: 'interfaces-controls', name: 'Interfaces & controls', short: 'Support deliberate decisions.', purpose: 'Make research state and required human actions visible.', design: 'The system includes an operator interface, recorded run outcomes and permission checks. The research director is read-only.', output: 'A clear distinction between completed work, a research result and permission to act.', example: 'A refused task can leave the research question open while preserving its state for review.', href: '/notes/safe-refusal/', linkLabel: 'Research permissions note' },
]

const routes = {
  '/': ['home', 'Katabasis | Markets Research by Max McCollom', 'Independent markets and investment research by Max McCollom, Financial Economics at Columbia University. Portfolio studies, financial hypotheses and evidence review.'],
  '/system': ['system', 'Research & System Design | Katabasis', 'The research decisions and connected subsystems behind Katabasis, from market data and financial hypotheses to portfolio analysis and evidence review.'],
  '/work': ['work', 'Selected Markets Research | Katabasis', 'Portfolio risk controls, an eight-ETF comparison and a data-integrity investigation. Selected independent research by Max McCollom.'],
  '/about': ['about', 'Max McCollom | Columbia Financial Economics', 'Financial Economics at Columbia University, planned Mathematics minor, expected May 2029. Creator of Katabasis since April 2026.'],
  '/notes': ['notes', 'Research Notes | Katabasis', 'Notes on research design, reproducibility and evidence from the Katabasis project.'],
  '/notes/safe-refusal': ['refusal', 'Research Permissions | Katabasis', 'How the research workflow distinguishes execution, research outcomes and operator permissions.'],
  '/work/narrowed-claim': ['robustness', 'Reproduction & Robustness | Katabasis', 'A research case about separating an exact reproduction from robustness to an observation choice.'],
  '/archive': ['archive', 'Visual Archive | Katabasis', 'An earlier visual exploration of the Katabasis project.'],
  '/credits': ['credits', 'Image Credits | Katabasis', 'Sources for the institutional identity images used on this site.'],
}

function currentRoute() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
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
  const section = page === 'case' ? 'work' : ['refusal', 'robustness'].includes(page) ? 'notes' : page
  const links = [
    { page: 'work', href: '/work/', label: 'Research' },
    { page: 'system', href: '/system/', label: 'System' },
    { page: 'notes', href: '/notes/', label: 'Notes' },
    { page: 'about', href: '/about/', label: 'About' },
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
    <nav className="footer-links" aria-label="Resources"><a href="/research/katabasis-overview.pdf">Research overview PDF</a><a href={source} target="_blank" rel="noreferrer">Website source</a><a href={linkedin} target="_blank" rel="noreferrer">LinkedIn</a></nav>
    <div className="footer-meta"><span>April 2026–present · New York</span><a href="/archive/">Visual archive</a><a href="/credits/">Image credits</a></div>
  </div></footer>
}

function Shell({ route, children }) {
  useEffect(() => {
    document.title = route.title
    document.documentElement.classList.add('public-site-route')
    document.body.classList.add('public-site-route')
    document.querySelector('meta[name="description"]')?.setAttribute('content', route.description)
    return () => { document.documentElement.classList.remove('public-site-route'); document.body.classList.remove('public-site-route') }
  }, [route.title, route.description])
  return <><a className="skip-link" href="#main">Skip to content</a><Header page={route.page} /><main id="main" tabIndex="-1">{children}</main><Footer /></>
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

function ResearchRows({ headingLevel = 3 } = {}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return <div className="research-list">{researchCases.map(study => <article className="research-row" key={study.id}>
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
    <section className="research-section shell section-block" aria-labelledby="home-research-title"><div className="section-heading"><div><h2 id="home-research-title">Selected studies</h2><p>Financial questions, research choices and the decisions that followed.</p></div><a className="text-link" href="/work/">All research</a></div><ResearchRows /></section>
    <section className="system-overview shell section-block" aria-labelledby="system-overview-title"><div className="section-heading"><div><h2 id="system-overview-title">One connected research process</h2><p>Six layers connect the market question to usable evidence, portfolio implications and review.</p></div><a className="text-link" href="/system/">Explore the system</a></div><ul className="layer-directory">{layers.map(layer => <li key={layer.id}><a href={'/system/#' + layer.id}>{layer.name}</a><p>{layer.purpose}</p></li>)}</ul></section>
    <Ownership />
    <section className="about-preview split-section shell section-block"><div><h2>Operating analysis and energy research</h2><p>My work at Ridgewood Water combined analysis in Excel with responsibility for municipal operating systems. My academic research includes energy cost and grid reliability.</p></div><div><p>I am seeking internships in markets and investment research, portfolio risk, and energy or commodities analysis. New York is my first choice.</p><a className="text-link" href="/about/">Background and experience</a></div></section>
  </Shell>
}

function Work({ route }) {
  return <Shell route={route}><header className="page-heading shell"><Breadcrumbs items={[{ label: 'Research' }]} /><h1>Selected research</h1><p className="page-lede">Portfolio controls, investment-product comparisons and the data behind an apparent market pattern.</p><p>Each study explains the question, the comparison, the design choices and the limits of the conclusion.</p></header><section className="shell work-rows" aria-label="Research studies"><ResearchRows headingLevel={2} /></section><Ownership /></Shell>
}

function Case({ route }) {
  const study = route.study
  const toc = [{ id: 'finding', label: 'Finding and limits' }, { id: 'question', label: 'Research question' }, { id: 'comparison', label: 'The comparison' }, { id: 'design', label: 'Design decisions' }, { id: 'interpretation', label: 'What the work demonstrates' }]
  const related = researchCases.filter(item => item.id !== study.id)
  return <Shell route={route}><article><header className="case-heading page-heading shell"><Breadcrumbs items={[{ label: 'Research', href: '/work/' }, { label: study.title }]} /><p className="section-label">{study.category} · Independent study</p><h1>{study.title}</h1><p className="page-lede">{study.summary}</p><p className="article-byline">Research design and evaluation by Max McCollom</p><ul className="tag-list" aria-label="Research topics">{study.tags.map(tag => <li key={tag}>{tag}</li>)}</ul></header>
      <div className="article-layout case-layout shell"><PageToc items={toc} /><div className="article-body case-body">
        <section id="finding" className="finding" aria-labelledby="finding-title" tabIndex="-1"><h2 id="finding-title">Finding and limits</h2><p className="finding-copy">{study.decision}</p><p className="limitation"><strong>Limitation.</strong> {study.limitation}</p></section>
        <section id="question" aria-labelledby="question-title" tabIndex="-1"><h2 id="question-title">The financial question</h2><p className="case-question">{study.question}</p><dl className="study-scope"><div><dt>Study scope</dt><dd>{study.scope}</dd></div></dl></section>
        <section id="comparison" aria-labelledby="comparison-title" tabIndex="-1"><h2 id="comparison-title">{study.comparison.heading}</h2><ResearchTable id={study.id + '-comparison'} {...study.comparison} /></section>
        <section id="design" aria-labelledby="design-title" tabIndex="-1"><h2 id="design-title">Why the study was designed this way</h2><ResearchTable id={study.id + '-design'} caption="Research decisions and their rationale" headers={['Decision', 'What I specified', 'Why it matters']} rows={study.steps.map(step => [step.title, step.body, step.rationale])} /></section>
        <section id="interpretation" aria-labelledby="interpretation-title" tabIndex="-1"><h2 id="interpretation-title">What this work demonstrates</h2><p>{study.relevance}</p><a className="text-link" href="/system/">See the connected research process</a></section>
        <nav className="related-links" aria-label="Related research"><h2>Other studies</h2><ul>{related.map(item => <li key={item.id}><a href={'/work/' + item.id + '/'}>{item.title}</a></li>)}</ul><a href="/work/">Return to all research</a></nav>
      </div></div></article></Shell>
}

function System({ route }) {
  const toc = [...layers.map(layer => ({ id: layer.id, label: layer.name })), { id: 'research-standards', label: 'Research standards' }, { id: 'implementation', label: 'Implementation and scope' }]
  const examples = layers.map(layer => [<a href={'#' + layer.id}>{layer.name}</a>, layer.purpose, <a href={layer.href || '#' + layer.id}>{layer.linkLabel || 'Economic mechanism and competing explanations'}</a>])
  return <Shell route={route}><header className="page-heading shell"><Breadcrumbs items={[{ label: 'System' }]} /><h1>The research system</h1><p className="page-lede">From the financial question to the evidence behind a portfolio decision.</p><p>I organized Katabasis around defining a mechanism, choosing usable evidence, comparing alternatives and retaining the reasoning behind a decision. The six layers below describe their purpose, the choices I made and the outputs the system preserves.</p></header>
    <div className="article-layout system-layout shell"><PageToc items={toc} system /><div className="article-body system-sections">
      <section className="system-map" aria-labelledby="system-map-title"><h2 id="system-map-title">Where the layers appear in public work</h2><ResearchTable id="system-examples" caption="Research layers and public examples" headers={['Layer', 'Purpose', 'Example or design record']} rows={examples} /></section>
      {layers.map(layer => <section className="system-layer system-section" id={layer.id} aria-labelledby={layer.id + '-title'} key={layer.id} tabIndex="-1"><div className="layer-title"><h2 id={layer.id + '-title'}>{layer.name}</h2><p>{layer.short}</p></div><p className="layer-purpose">{layer.purpose}</p><dl className="layer-record"><div><dt>My design decision</dt><dd>{layer.design}</dd></div><div><dt>What the system preserves</dt><dd>{layer.output}</dd></div></dl><div className="layer-example"><h3>In practice</h3><p>{layer.example}</p>{layer.href && <a className="text-link" href={layer.href}>{layer.linkLabel}</a>}</div></section>)}
      <section id="research-standards" className="design-principles" aria-labelledby="research-standards-title" tabIndex="-1"><h2 id="research-standards-title">Research standards</h2><p>A financial hypothesis needs an explanation of why an effect could exist and what evidence would make the explanation weaker. Mechanism, counterparty incentives, constraints and capacity belong in that explanation.</p><dl className="principle-list"><div><dt>Specify the comparison</dt><dd>State the objective and alternatives before interpreting the output.</dd></div><div><dt>Keep assumptions visible</dt><dd>Record data coverage, historical periods, costs and important simplifications.</dd></div><div><dt>Separate the outcomes</dt><dd>A completed calculation, a reproducible result and a supported financial claim are different judgments.</dd></div><div><dt>Preserve the reason for change</dt><dd>Retain why a hypothesis, research task or conclusion was revised.</dd></div></dl></section>
      <section id="implementation" className="implementation" aria-labelledby="implementation-title" tabIndex="-1"><h2 id="implementation-title">Implementation and project scope</h2><p>I set the questions, methods, data choices, system structure, tests and interpretation. AI generates the implementation code from those specifications.</p><p>The broader project includes market-data and options-research components, controlled replay, portfolio studies, source-based research workflows and an operator interface. These components are at different stages of development.</p><p>The public site presents selected studies and design decisions. Historical study results do not establish live investment performance.</p><nav className="related-links" aria-label="Further project context"><a href="/notes/">Research notes</a><a href="/about/">About Max and the project</a></nav></section>
    </div></div>
  </Shell>
}

function About({ route }) {
  return <Shell route={route}><header className="page-heading shell about-heading"><div><Breadcrumbs items={[{ label: 'About' }]} /><h1>Max McCollom</h1><p className="page-lede">Financial Economics at Columbia University.<br />Mathematics minor planned. Expected May 2029.</p><p>I am interested in how economic ideas become useful investment and trading decisions. I created Katabasis in April 2026 to pursue that question through independent research and system design.</p><a className="text-link" href={linkedin} target="_blank" rel="noreferrer">Connect on LinkedIn</a></div><div className="education-mark"><img src="/media/columbia-university-white.svg" alt="Columbia University" width="320" height="160" /><p>Financial Economics<br /><span>2026–2029 · New York</span></p></div></header>
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
    <section className="note-section"><h2>{robustness ? 'What the system needs to preserve' : 'The design choice'}</h2><p>{robustness ? 'The reproduction result and the robustness result are recorded independently, so one successful test cannot erase an unfavorable result from another.' : 'Execution, research outcome and required human action remain distinct. A paused research mission retains its question, evidence and task history, and can be reviewed without treating an unanswered question as a completed finding.'}</p></section>
    <nav className="related-links" aria-label="Related project material"><a href="/system/">Research and system design</a><a href="/notes/">All research notes</a></nav></article></Shell>
}

function Notes({ route }) {
  return <Shell route={route}><header className="page-heading shell"><Breadcrumbs items={[{ label: 'Notes' }]} /><h1>Research notes</h1><p className="page-lede">Decisions behind the research workflow.</p><p>How the system distinguishes a calculation, a supported conclusion and permission to act.</p></header><section className="notes-list shell" aria-label="Research notes"><article className="note-row"><h2><a href="/work/narrowed-claim/">Reproduction and robustness answer different questions</a></h2><p>An exact rerun and a test of sensitivity to an observation choice are recorded independently.</p></article><article className="note-row"><h2><a href="/notes/safe-refusal/">A completed task and a research result are separate outcomes</a></h2><p>Execution, research outcomes and required human actions stay distinct in the research record.</p></article></section></Shell>
}

function Simple({ route }) {
  const archive = route.page === 'archive'
  return <Shell route={route}><section className="page-heading shell simple-page"><h1>{archive ? 'An earlier visual exploration' : 'Page not found'}</h1><p className="page-lede">{archive ? 'The earlier 3D presentation remains available as a record of the project’s visual development.' : 'Explore the selected research or return to the home page.'}</p><a className="text-link" href={archive ? '/estate/' : '/'}>{archive ? 'Open the 3D archive' : 'Return home'}</a></section></Shell>
}

function Credits({ route }) {
  return <Shell route={route}><article className="page-heading shell credits-page"><Breadcrumbs items={[{ label: 'Image credits' }]} /><h1>Image credits</h1><div className="credits-list"><section><h2>Columbia University</h2><p>The complete University wordmark is from <a href="https://worldprojects.columbia.edu/sites/default/files/2023-12/columbia-university-logo-white.svg">Columbia World Projects</a>. It identifies my university in the education entry.</p></section><section><h2>Ridgewood Water</h2><p>The utility logo is reproduced from its <a href="https://water.ridgewoodnj.net/wp-content/uploads/2025/07/B2775-Ridgewood-water-dept-2025_REV6.pdf">official 2025 Annual Drinking Water Quality Report</a>. It identifies my former employer.</p></section><section><h2>Katabasis</h2><p>The gold descending K and Katabasis wordmark are the project's original identity. The header uses a crop of the original artwork; the complete artwork appears on the About page.</p></section></div></article></Shell>
}

export default function PublicSite() {
  const route = currentRoute()
  const pages = { home: Home, work: Work, case: Case, system: System, about: About, notes: Notes, refusal: Note, robustness: Note, credits: Credits }
  const Page = pages[route.page] || Simple
  return <Page route={route} />
}
