# Katabasis

The public showcase site for Katabasis. This repository contains the site and
nothing else: no trading logic, no strategy detail, no data, and no connection
to any live system. It is a standalone, fully static presentation artifact.

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
