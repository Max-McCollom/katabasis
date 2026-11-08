import { useEffect, useState } from 'react'
import '@fontsource-variable/newsreader/wght.css'
import { researchCases } from './research.js'
import './site.css'

const linkedin = 'https://www.linkedin.com/in/max-mccollom-448bbb367/'
const source = 'https://github.com/Max-McCollom/katabasis'
const layers = [
  { name: 'Market data & sources', short: 'Know what the inputs mean.', purpose: 'Make the evidence comparable before drawing a financial conclusion.', design: 'I choose the data requirements and checks around source dates, corporate-action adjustments and history coverage.', output: 'Inputs whose source, timing and limitations can be inspected.', example: 'A placebo test exposed incompatible price adjustments in a return calculation.', href: '/work/data-mismatch/' },
  { name: 'Financial hypotheses', short: 'Explain the economic mechanism.', purpose: 'Turn a plausible market story into a question that can be investigated.', design: 'I specify the mechanism, counterparty incentives, market constraints and capacity considerations, then define what would weaken the claim.', output: 'A research specification with competing explanations and invalidation criteria.', example: 'The research framework asks who is on the other side of an opportunity and why the proposed effect could persist.' },
  { name: 'Historical analysis', short: 'Test the question against evidence.', purpose: 'Compare a proposed relationship with alternatives and check how sensitive it is to the analysis choices.', design: 'I define comparisons, historical periods, cost assumptions and diagnostic tests. Controlled replay and recorded inputs support review.', output: 'Study results that distinguish an executed calculation from a supported conclusion.', example: 'Portfolio controls were compared on growth, drawdown, allocation tracking and turnover.', href: '/work/portfolio-controls/' },
  { name: 'Portfolio research', short: 'Connect the analysis to an objective.', purpose: 'Understand how an investment choice changes portfolio behavior.', design: 'I compare products by their role and evaluate controls against explicit objectives for risk, participation and the cost of trading.', output: 'Comparisons with the trade-offs and history limitations stated.', example: 'An eight-ETF comparison separates cash-management, dividend-equity and option-income roles.', href: '/work/etf-comparison/' },
  { name: 'Evidence & research workflow', short: 'Keep the reasoning inspectable.', purpose: 'Preserve the path from the original question to the current conclusion.', design: 'I designed the workflow around mission questions, dependent tasks, source records, hypothesis updates and reasons for changing a plan.', output: 'Research records that retain unresolved questions and the evidence behind revisions.', example: 'Source research, local analysis and synthesis can contribute different kinds of evidence to the same question.' },
  { name: 'Interfaces & controls', short: 'Support deliberate decisions.', purpose: 'Make research state and required human actions visible.', design: 'The system includes an operator interface, recorded run outcomes and permission checks. The research director is read-only.', output: 'A clear distinction between completed work, a research result and permission to act.', example: 'A refused task can leave the research question open while preserving its state for review.', href: '/notes/safe-refusal/' },
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

function Mark() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 7h22M8 13h16M11 19h10M14 25h4" /></svg>
}

function Header({ page }) {
  const [open, setOpen] = useState(false)
  return <header className="site-header"><div className="shell header-inner">
    <a href="/" className="wordmark" aria-label="Katabasis home"><Mark /><span>Katabasis</span></a>
    <button className="menu-toggle" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>Menu <span aria-hidden="true">{open ? '−' : '+'}</span></button>
    <nav id="site-nav" className={open ? 'site-nav is-open' : 'site-nav'} aria-label="Primary navigation">
      <a href="/work/" aria-current={page === 'work' || page === 'case' ? 'page' : undefined}>Selected research</a>
      <a href="/system/" aria-current={page === 'system' ? 'page' : undefined}>Research & design</a>
      <a href="/about/" aria-current={page === 'about' ? 'page' : undefined}>About Max</a>
      <a className="nav-contact" href={linkedin} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
    </nav>
  </div></header>
}

function Footer() {
  return <footer className="site-footer"><div className="shell">
    <div className="footer-main"><div><a className="wordmark" href="/"><Mark /><span>Katabasis</span></a><p>Independent markets research by Max McCollom.<br />Columbia University · New York</p></div>
      <div className="footer-links"><a href="/work/">Selected research</a><a href="/system/">Research & system design</a><a href="/about/">About & experience</a></div>
      <div className="footer-links"><a href={linkedin} target="_blank" rel="noreferrer">Connect on LinkedIn ↗</a><a href="/research/katabasis-overview.pdf">Research overview PDF ↗</a><a href={source} target="_blank" rel="noreferrer">Public website source ↗</a></div>
    </div>
    <div className="footer-bottom"><span>Independent project · April 2026–present</span><a href="/archive/">Visual archive</a><a href="/credits/">Image credits</a></div>
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
  return <><a className="skip-link" href="#main">Skip to content</a><Header page={route.page} /><main id="main">{children}</main><Footer /></>
}

function ResearchRows({ home = false }) {
  return <div className="research-list">{researchCases.map((study, index) => <a className="research-row" href={'/work/' + study.id + '/'} key={study.id}>
    <div className="research-index"><span>0{index + 1}</span><small>{study.category}</small></div>
    <div className="research-copy"><h3>{study.title}</h3><p>{study.summary}</p><div className="tag-list">{study.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
    <div className="research-action"><span>{home ? 'Explore the study' : 'Read the research'}</span><i aria-hidden="true">↗</i></div>
  </a>)}</div>
}

function Ownership() {
  return <section className="ownership shell"><div><p className="section-label">My contribution</p><h2>Research direction<br />and design decisions.</h2></div><div className="ownership-copy"><p>I choose the financial questions, methods and data; specify how the components work together; and evaluate what the findings support.</p><p>AI generates the software implementation from my specifications. My work centers on research judgment, system design and the decisions that follow from the evidence.</p><a className="text-link" href="/system/">Explore those design choices <span aria-hidden="true">↗</span></a></div></section>
}

function Home({ route }) {
  return <Shell route={route}>
    <section className="home-hero"><div className="hero-shade" />
      <div className="shell hero-grid"><div className="hero-content"><p className="hero-label">An independent project by Max McCollom</p><h1>A platform for<br /><em>markets research.</em></h1><p className="hero-description">I designed Katabasis to connect market data, financial hypotheses, historical testing and portfolio analysis. I set the research questions, methods and evaluation criteria, then interpret what the findings support.</p><div className="hero-actions"><a className="button button-light" href="/work/">Explore selected research <span aria-hidden="true">↗</span></a><a className="hero-about" href="/system/">Project scope <span aria-hidden="true">→</span></a></div></div>
      <figure className="hero-research-map"><figcaption><span>Selected study / 01<br /><small>Portfolio analysis</small></span></figcaption><div className="map-question"><span>The research</span><p>Comparing portfolio risk controls</p></div><div className="study-numbers"><div><strong>26</strong><span>Historical configurations</span></div><div><strong>3</strong><span>Transaction-cost assumptions</span></div></div><p className="study-summary">Volatility targeting, drawdown controls and rebalancing bands compared on growth, drawdown, tracking and turnover.</p><div className="map-decision"><span>Selected finding</span><p>A rebalancing band met the study’s historical tracking and turnover criteria.</p></div><a className="text-link" href="/work/portfolio-controls/">Read the study ↗</a></figure></div>
      <div className="hero-bottom shell"><span>Financial Economics<br /><strong>Columbia University</strong></span><span>Mathematics minor planned<br /><strong>Expected May 2029</strong></span><span>Independent project<br /><strong>Since April 2026</strong></span></div>
    </section>
    <section className="research-section shell"><div className="section-heading"><div><p className="section-label">Selected research</p><h2>Portfolio controls, product research<br /><em>and data validation.</em></h2></div><p>Three completed investigations, with the financial question, research choices and resulting decision explained.</p></div><ResearchRows home /></section>
    <Ownership />
    <section className="system-intro"><div className="shell"><div className="section-heading"><div><p className="section-label">The connected system</p><h2>How the research<br />fits together.</h2></div><p>Katabasis connects market data, financial hypotheses, historical analysis, portfolio studies and evidence review.</p></div>
      <div className="process-strip">{['Question & mechanism', 'Data & comparisons', 'Analysis & checks', 'Portfolio implications', 'Evidence & revision'].map((text, i) => <div key={text}><span>0{i + 1}</span><strong>{text}</strong>{i < 4 && <i aria-hidden="true">→</i>}</div>)}</div>
      <div className="section-end"><p>The design keeps the original question, research assumptions and reasons for changing a conclusion visible.</p><a className="text-link" href="/system/">Research & system design <span aria-hidden="true">↗</span></a></div></div></section>
    <section className="about-preview shell"><div><p className="section-label">Beyond the project</p><h2>Utility operations<br />and energy research.</h2></div><div><p>My experience at Ridgewood Water combines analysis in Excel with responsibility for real operating systems. My academic research includes energy cost and reliability.</p><p>I am seeking internships in markets and investment research, portfolio risk, and energy or commodities analysis. New York is my first choice.</p><a className="text-link" href="/about/">Background & experience <span aria-hidden="true">↗</span></a></div></section>
  </Shell>
}

function Work({ route }) {
  return <Shell route={route}><section className="page-heading shell"><p className="section-label">Selected research</p><h1>From a financial question<br /><em>to an evaluated result.</em></h1><p className="page-lede">Comparative investment research, portfolio studies and a closer look at the data behind an apparent market pattern.</p></section><section className="shell work-rows"><ResearchRows /></section><Ownership /></Shell>
}

function Case({ route }) {
  const s = route.study
  return <Shell route={route}><article><header className="case-heading shell"><a className="back-link" href="/work/">← Selected research</a><p className="section-label">{s.category} · Independent study</p><h1>{s.title}</h1><p className="page-lede">{s.summary}</p><div className="tag-list">{s.tags.map(t => <span key={t}>{t}</span>)}</div></header>
    <div className="case-layout shell"><aside className="case-sidebar"><span className="section-label">Research record</span><a href="#question">The question</a><a href="#approach">The approach</a><a href="#finding">The finding</a><a href="#interpretation">Interpretation</a><p>Research design & evaluation<br /><strong>Max McCollom</strong></p></aside>
      <div className="case-body"><section id="question"><p className="section-label">01 · Question</p><h2>{s.question}</h2></section><section id="approach"><p className="section-label">02 · Approach</p>{s.steps.map((step,i) => <div className="method-row" key={step.title}><span>0{i+1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></div>)}</section>
        <section id="finding" className="finding"><p className="section-label">03 · Finding & decision</p><h2>{s.decision}</h2></section>
        <section id="interpretation"><p className="section-label">04 · Interpretation</p><p>{s.limitation}</p><h3>What this work demonstrates</h3><p>{s.relevance}</p></section>
        <div className="case-next"><a className="text-link" href="/system/">Explore the research design <span aria-hidden="true">↗</span></a><a className="text-link" href="/work/">All selected research <span aria-hidden="true">↗</span></a></div>
      </div></div></article></Shell>
}

function System({ route }) {
  const [active, setActive] = useState(0)
  const layer = layers[active]
  function move(event, index) {
    const keys = ['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End']
    if (!keys.includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? layers.length-1 : (index + (['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1) + layers.length) % layers.length
    setActive(next)
    event.currentTarget.parentElement.querySelectorAll('button')[next]?.focus()
  }
  return <Shell route={route}><section className="page-heading shell"><p className="section-label">Research & system design</p><h1>The financial question<br /><em>sets the design.</em></h1><p className="page-lede">I organized Katabasis around the work needed to investigate markets: define a mechanism, choose usable evidence, compare alternatives and retain the reasoning behind a decision.</p></section>
    <section className="layer-section shell" aria-label="Explore the research system"><div className="layer-tabs" role="tablist" aria-label="Research subsystems" aria-orientation="vertical">{layers.map((item,index) => <button id={'layer-tab-'+index} type="button" role="tab" aria-selected={index===active} aria-controls="layer-panel" tabIndex={index===active ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => move(event,index)} key={item.name}><span>0{index+1}</span>{item.name}<i aria-hidden="true">↗</i></button>)}</div>
      <div className="layer-panel" id="layer-panel" role="tabpanel" aria-labelledby={'layer-tab-'+active}><p className="section-label">0{active+1} · {layer.name}</p><h2>{layer.short}</h2><p className="layer-purpose">{layer.purpose}</p><dl><div><dt>My design decision</dt><dd>{layer.design}</dd></div><div><dt>What the system preserves</dt><dd>{layer.output}</dd></div></dl><div className="layer-example"><span className="section-label">In practice</span><p>{layer.example}</p>{layer.href && <a className="text-link" href={layer.href}>Read the related work ↗</a>}</div></div>
    </section>
    <section className="design-principles shell"><div><p className="section-label">Research standards</p><h2>Mechanism, counterparty,<br />constraints and capacity.</h2><p>A financial hypothesis needs an explanation of why an effect could exist and what evidence would make the explanation weaker.</p></div><div className="principle-list"><div><span>01</span><h3>Specify the comparison</h3><p>State the objective and alternatives before interpreting the output.</p></div><div><span>02</span><h3>Keep assumptions visible</h3><p>Record data coverage, historical periods, costs and important simplifications.</p></div><div><span>03</span><h3>Separate the outcomes</h3><p>A completed calculation, a reproducible result and a supported financial claim are different judgments.</p></div><div><span>04</span><h3>Preserve the reason for change</h3><p>Retain why a hypothesis, research task or conclusion was revised.</p></div></div></section>
    <section className="implementation shell"><div><p className="section-label">Implementation context</p><h2>Research direction<br />and implementation.</h2></div><div><p>I set the questions, methods, data choices, system structure, tests and interpretation. AI generates the implementation code from those specifications.</p><p>The broader project includes market-data and options-research components, controlled replay, portfolio studies, source-based research workflows and an operator interface. These components are at different stages of development.</p><p>The public site presents selected studies and design decisions. Historical study results do not establish live investment performance.</p><a className="text-link" href="/notes/">Additional research notes ↗</a></div></section>
  </Shell>
}

function About({ route }) {
  return <Shell route={route}><section className="page-heading shell about-heading"><div><p className="section-label">About the researcher</p><h1>Max McCollom</h1><p className="page-lede">Financial Economics at Columbia University.<br />Mathematics minor planned. Expected May 2029.</p><p>I am interested in how economic ideas become useful investment and trading decisions. I created Katabasis in April 2026 to pursue that question through independent research and system design.</p><a className="text-link" href={linkedin} target="_blank" rel="noreferrer">Connect on LinkedIn ↗</a></div><div className="education-mark"><img src="/media/columbia-university-white.svg" alt="Columbia University" /><p>Financial Economics<br /><span>2026–2029 · New York</span></p></div></section>
    <section className="experience-section shell"><div className="section-heading"><div><p className="section-label">Experience & initiative</p><h2>Research with<br /><em>practical responsibility.</em></h2></div><p>Independent financial research, operating analysis and a community project carried through to delivery.</p></div>
      <div className="experience-row"><div className="org-symbol katabasis-symbol"><Mark /></div><div><p className="section-label">April 2026–present · Independent project</p><h3>Creator and Independent Markets Researcher</h3><h4>Katabasis</h4><p>I define the research questions, methods, data choices, architecture and evaluation criteria for an integrated markets research platform, using AI-generated software implementation.</p><a className="text-link" href="/work/">Selected research ↗</a></div></div>
      <div className="experience-row"><div className="org-symbol"><img src="/media/ridgewood-water-logo.png" alt="Ridgewood Water" /></div><div><p className="section-label">October 2024–August 2026 · Ridgewood, NJ</p><h3>SCADA Systems Operator & Data Analyst</h3><h4>Ridgewood Water</h4><p>Analyzed operating data in Excel to identify pump-scheduling improvements with estimated annual electricity savings of $10,000+. Developed a procedure that maintained system pressure during a three-day facility outage and was adopted system-wide.</p><p className="supporting-copy">Worked with supervisory control and data acquisition systems for a municipal utility serving 60,000 residents across four municipalities.</p></div></div>
      <div className="experience-row"><div className="org-symbol service-symbol" aria-hidden="true">12</div><div><p className="section-label">2022–2024 · Independent service project</p><h3>Community Technology Access Project</h3><p>Led a team that built and donated 12 workstations to underserved youth. Coordinated procurement and assembly, then trained recipients in maintenance and troubleshooting.</p></div></div>
    </section>
    <section className="academic-section shell"><div><p className="section-label">Academic research</p><h2>Energy cost<br />and reliability.</h2></div><div><p>In a 20-page academic paper completed in Fall 2024, I compared nuclear, renewable and fossil-fuel power using levelized cost of energy, safety metrics and grid reliability.</p><p>This work, together with utility operations experience, informs my interest in energy and commodities markets.</p></div></section>
    <section className="contact-section"><div className="shell"><p className="section-label">Internship interests</p><h2>Markets & investment research.<br />Portfolio risk.<br />Energy & commodities.</h2><div><p>New York is my first choice. I am also open to Chicago, San Francisco, Los Angeles, Dallas, Miami and international opportunities.</p><a className="button button-dark" href={linkedin} target="_blank" rel="noreferrer">Connect on LinkedIn ↗</a></div></div></section>
  </Shell>
}

function Note({ route }) {
  const robustness = route.page === 'robustness'
  return <Shell route={route}><article className="note-article shell"><a className="back-link" href="/notes/">← Research notes</a><p className="section-label">Research design</p><h1>{robustness ? 'Reproduction and robustness answer different questions.' : 'A completed task and a research result are separate outcomes.'}</h1>
    <p className="page-lede">{robustness ? 'An exact rerun reproduced a recorded result. Changing an observation choice weakened part of the claim.' : 'The research workflow records whether work ran, whether its permissions were satisfied and whether the evidence supports the question.'}</p>
    <h2>{robustness ? 'The research decision' : 'Why the distinction matters'}</h2><p>{robustness ? 'The claim contained more than one condition. Matching the original output established reproduction from the recorded inputs. A separate timing test did not support the full claim, so the conclusion was narrowed.' : 'A task can run correctly and return evidence against a hypothesis. A source can be retrieved successfully while leaving the question unresolved. A task can also be refused before dispatch because an approved permission is absent.'}</p>
    <h2>{robustness ? 'What the system needs to preserve' : 'The design choice'}</h2><p>{robustness ? 'The reproduction result and the robustness result are recorded independently, so one successful test cannot erase an unfavorable result from another.' : 'Execution, research outcome and required human action remain distinct. A paused research mission retains its question, evidence and task history, and can be reviewed without treating an unanswered question as a completed finding.'}</p>
    <a className="text-link" href="/system/">Research & system design ↗</a></article></Shell>
}

function Notes({ route }) {
  return <Shell route={route}><section className="page-heading shell"><p className="section-label">Research notes</p><h1>Decisions behind<br /><em>the research workflow.</em></h1><p className="page-lede">Two examples of how the system distinguishes a calculation, a research conclusion and permission to act.</p></section><section className="notes-list shell"><a href="/work/narrowed-claim/"><span>01</span><h2>Reproduction and robustness answer different questions.</h2><i aria-hidden="true">↗</i></a><a href="/notes/safe-refusal/"><span>02</span><h2>A completed task and a research result are separate outcomes.</h2><i aria-hidden="true">↗</i></a></section></Shell>
}

function Simple({ route }) {
  return <Shell route={route}><section className="page-heading shell"><p className="section-label">{route.page === 'archive' ? 'Visual archive' : '404'}</p><h1>{route.page === 'archive' ? 'An earlier visual exploration.' : 'Page not found.'}</h1><p className="page-lede">{route.page === 'archive' ? 'The earlier 3D presentation remains available as a record of the project’s visual development.' : 'Explore the selected research or return to the home page.'}</p><a className="text-link" href={route.page === 'archive' ? '/estate/' : '/'}>{route.page === 'archive' ? 'Open the 3D archive ↗' : 'Return home ↗'}</a></section></Shell>
}

function Credits({ route }) {
  return <Shell route={route}><section className="page-heading shell"><p className="section-label">Image credits</p><h1>Institutional images.</h1><div className="credits-list"><h2>Columbia University</h2><p>The complete University wordmark is from <a href="https://worldprojects.columbia.edu/sites/default/files/2023-12/columbia-university-logo-white.svg">Columbia World Projects</a>. It identifies my university in the education entry.</p><h2>Ridgewood Water</h2><p>The utility logo is reproduced from its <a href="https://water.ridgewoodnj.net/wp-content/uploads/2025/07/B2775-Ridgewood-water-dept-2025_REV6.pdf">official 2025 Annual Drinking Water Quality Report</a>. It identifies my former employer.</p><h2>Katabasis</h2><p>The project mark and research diagrams were created for this independent project.</p></div></section></Shell>
}

export default function PublicSite() {
  const route = currentRoute()
  const pages = { home: Home, work: Work, case: Case, system: System, about: About, notes: Notes, refusal: Note, robustness: Note, credits: Credits }
  const Page = pages[route.page] || Simple
  return <Page route={route} />
}
