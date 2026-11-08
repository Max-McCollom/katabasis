# Katabasis

Katabasis is an independent markets research project by Max McCollom, a
Financial Economics student at Columbia University planning a minor in
Mathematics. Started in April 2026, it examines how market data, assumptions
and portfolio constraints shape investment and trading decisions.

Max defines the financial questions, selects methods and data, designs the
research process and evaluates results. The work spans portfolio analysis,
hypothesis evaluation and data validation, with a focus on making assumptions,
comparisons and conclusions reviewable. AI generates the implementation code
from his specifications.

This repository contains the source for the public presentation website. It
shares high-level system design and sanitized case studies. The research
implementation and working data are maintained separately. The website is
fully static and has no connection to a live trading system.

[Explore Katabasis](https://katabasis.rip/) ·
[Max on LinkedIn](https://www.linkedin.com/in/max-mccollom-448bbb367/)

## Public research pages

The research index leads to five studies with a question, comparison,
design decisions, recorded findings and limitations. The system overview
connects the research flow to eleven subsystem guides, grouped into market
evidence, analysis and evaluation, and research operations. A searchable
directory, section navigation, breadcrumbs and related-study links support
exploration at different levels of depth.

The guides cover market data and measurement, hypothesis specification,
prospective observation, information timing, historical simulation, evidence
evaluation, options experiment design, portfolio analysis, research orchestration,
governance and monitoring. They distinguish documented research, implemented
components and unfinished integration work. These are guide families, rather
than a count of independent trading engines. Earlier guide URLs redirect to the
current functional names.

The selectable architecture map distinguishes research relationships from
three documented handoff schematics. Each guide includes a procedure diagram
and relevant result or review exhibits. Five case pages include recorded outputs:
a cost-sensitivity criteria matrix, product-research decisions, price-field
compatibility analysis, a hypothesis-rubric revision, and separate reproduction
and sensitivity findings. Figures label recorded findings and explanatory
schematics, retain their interpretation limits, and include source-review dates.
No invented return series, private thresholds or raw system screens are used.

All pages use the original Katabasis project identity. Institutional logos
identify Max's university and former employer.

The public case tables summarize the research design and interpretation;
they are not performance datasets or live operating results.

## Safety model

This is a public repository, so the gate against leakage sits before a commit,
not after. Once something is in git history, "removed" is not "gone."

- **Allowlist (default-deny).** `.allowlist` enumerates the only paths that may
  be committed. Everything else is rejected.
- **Pre-commit hook.** `.githooks/pre-commit` runs the allowlist check on every
  staged file. It is the load-bearing local control. Wire it with
  `git config core.hooksPath .githooks` (the `prepare` script does this for you
  on `npm install`).
- **CI backstop.** The deploy workflow re-runs the allowlist check over every
  tracked file. On a public repo CI is a backstop only; the commit is already
  public by the time CI sees it.
- **Editorial review.** `docs/EDITORIAL_CHECKLIST.md` is the human pass for the
  one thing automation cannot catch: ordinary prose that says too much. Run it
  before every publish.

## Develop

```sh
npm install      # installs deps and wires the pre-commit hook
npm run dev      # local dev server
npm run build    # sealed static build into dist/
npm run preview  # serve the built site locally
```

## Deploy

Pushing to `main` builds and deploys to GitHub Pages via
`.github/workflows/deploy.yml`. The site serves at the custom apex domain in
`public/CNAME`.
