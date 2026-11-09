import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { researchCases } from '../src/site/research.js'
import { systemPages } from '../src/site/systems.js'
import { subsystemPath } from '../src/site/navigation.js'

const routes = [
  ['system/components', 'Research Subsystems | Katabasis', 'Explore data, discovery, observation, simulation, portfolio and research-operations components behind Katabasis.'],
  ['system', 'Research & System Design | Katabasis', 'The research decisions and connected subsystems behind Katabasis, from market data and financial hypotheses to portfolio analysis and evidence review.'],
  ['work', 'Selected Markets Research | Katabasis', 'Portfolio risk controls, an eight-ETF comparison and a data-integrity investigation. Selected independent research by Max McCollom.'],
  ['work/portfolio-controls', 'Comparing Portfolio Risk Controls | Katabasis', 'A study of 26 portfolio-control configurations under three transaction-cost assumptions, examining growth, drawdown, tracking and turnover.'],
  ['work/etf-comparison', 'Comparing Income and Cash-Management ETFs | Katabasis', 'An eight-fund comparison organized by portfolio role, liquidity, fees and historical drawdown.'],
  ['work/data-mismatch', 'A Placebo Check for a Return Calculation | Katabasis', 'An investigation of an apparent return pattern that traced the calculation back to incompatible price adjustments.'],
  ['work/narrowed-claim', 'Reproduction & Robustness | Katabasis', 'A research case about separating an exact reproduction from robustness to an observation choice.'],
  ['notes', 'Research Notes | Katabasis', 'Notes on research design, reproducibility and evidence from the Katabasis project.'],
  ['notes/safe-refusal', 'Research Permissions | Katabasis', 'How the research workflow distinguishes execution, research outcomes and operator permissions.'],
  ['about', 'Max McCollom | Columbia Financial Economics', 'Financial Economics at Columbia University, planned Mathematics minor, expected May 2029. Creator of Katabasis since April 2026.'],
  ['credits', 'Image Credits | Katabasis', 'Sources for the institutional identity images used on the site.'],
]
const expandedRoutes = new Map([...routes, ...researchCases.map(item => ['work/' + item.id, item.title + ' | Katabasis', item.summary]), ...systemPages.flatMap(item => { const canonical = subsystemPath(item).replace(/^\/|\/$/g, ''); return [[canonical, item.title + ' | Katabasis', item.deck, canonical], ...((item.slug && item.slug !== item.id) ? [['system/' + item.id, item.title + ' | Katabasis', item.deck, canonical]] : [])] })].map(item => [item[0], item]))
const base = readFileSync('dist/index.html', 'utf8')
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
for (const [route, title, description, canonical = route] of expandedRoutes.values()) {
  const url = 'https://katabasis.rip/' + canonical + '/'
  const html = base
    .replace(/<title>[^<]*<\/title>/, '<title>' + escape(title) + '</title>')
    .replace(/(<meta\s+name="description"\s+content=")[^"]*"/, '$1' + escape(description) + '"')
    .replace(/(<meta property="og:title" content=")[^"]*"/, '$1' + escape(title) + '"')
    .replace(/(<meta property="og:description" content=")[^"]*"/, '$1' + escape(description) + '"')
    .replace(/(<meta property="og:url" content=")[^"]*"/, '$1' + url + '"')
    .replace(/(<link rel="canonical" href=")[^"]*"/, '$1' + url + '"')
  mkdirSync('dist/' + route, { recursive: true })
  writeFileSync('dist/' + route + '/index.html', route !== canonical ? html.replace('</head>', '<meta http-equiv="refresh" content="0;url=/' + canonical + '/" /></head>') : html)
}
writeFileSync('dist/404.html', base)
