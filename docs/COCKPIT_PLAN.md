# Katabasis Cockpit — Architecture & Security Plan

**Planning document. No implementation.** No UI, no backend, no authentication,
no panels are built by this doc. It defines the architecture, the security model,
and the boundary taxonomy that all later cockpit work must satisfy. It is the
artifact that has to exist *before* any panel.

---

## 0. Status, lineage, and authority

**Direction.** Katabasis pivots from a first-person 3D estate (a walking-sim that
presented the research system as atmosphere) to a **read-only telemetry cockpit**
for the research engine: an institutional-grade observability surface that
makes system state, research provenance, data coverage, validation gates, and the
options-native substrate **legible**, without exposing proprietary strategy logic.

**Lineage (verified at authoring).**
- The estate world is preserved at the annotated tag **`archive/estate-world`**
  (`main@ceb9743`). It is archived, **not deleted**, and remains revisitable.
- The unapproved fixture-profile pass remains on branch
  `creative/fixture-profiles`; it is intentionally outside the archive tag and is
  not part of the pivot.
- This document is authored on branch **`pivot/cockpit`**, cut from `main`.
- The git remote published **no branches** at authoring time (`git ls-remote`
  empty), so nothing is live to break. This is a de-risk, not a license to relax
  the boundary.

**Boundary authority (carries verbatim, governs everything here).**
- **`CLAUDE.md` §1 (Proprietary Boundary) and §2 (Repository Isolation & Build
  Safety) are unchanged by this pivot and matter MORE now, not less.** A cockpit
  is closer to the proprietary line than metaphor ever was (see §1 below).
- `CLAUDE.md` §3–§4 (chaptered design, scroll structure, copy register tied to
  chapters), §6–§7 (stack/deploy framed around four chapters): **superseded for
  the cockpit.** They describe a product that no longer exists.
- `CLAUDE.md` §5 (frozen copy): may survive as an about/manifesto layer. **Max's
  call** (see §12). Until then it is neither required nor rewritten.

**The governing truth still holds (`CLAUDE.md` §1):** on a public repo, "removed"
is not "gone." Anything committed once is recoverable from history and from web
archives. Every gate here sits **before** publication.

---

## 1. The reframe (why security is load-bearing, not a feature)

The estate world was boundary-safe **by construction**: it showed *nothing real*.
Abstract atmosphere cannot leak a strategy because it contains no system state.

A telemetry cockpit is boundary-**adjacent** by construction: its entire value
proposition is showing something *real* about the engine. **The pivot inverts
the safety posture.** Every panel now sits near the proprietary line instead of
far from it.

This is not a reason to abandon the pivot. It is the central design constraint,
and the response is to make the system's own discipline the product: the cockpit
states what it knows, what it does not, and what it is forbidden to show, with the
same honesty the research engine applies to its own results. The panel-state
taxonomy (§3) is that discipline made visible. It is load-bearing, not decoration.

---

## 2. Security model (THE load-bearing constraint)

### 2.1 Two modes

- **Public / recruiter mode.** Fully static (GitHub Pages), zero backend. Ships
  **only** demo-synthetic, irreversibly-aggregated, or explicitly recruiter-safe
  payloads. **Every shipped asset is assumed fully public.**
- **Private / internal mode.** A **separate** authenticated application with
  **server-side authorization** in front of the data. Planned in this doc,
  **not implemented in Phase 1.** Real telemetry never becomes a static asset and
  never enters the public repo.

### 2.2 Why static hosting cannot protect real telemetry (the core truth)

1. A static host returns the exact bytes to **anyone** who requests the URL. There
   is no server-side decision point at which authorization could be enforced.
2. A client-side login is JavaScript deciding whether to **render** data the
   browser **has already downloaded**. The payload is in the network tab, in the
   bundle, and in the deployed asset regardless of what the UI displays.
   Login-gated static JSON is not weak protection; it is **anti-protection**, because
   it *looks* guarded. That is exactly the "feels like protection but isn't"
   self-deception the Katabasis thesis is built to refuse.
3. Git history plus web archives make any shipped asset **permanent and
   retrievable** even after deletion.

**Conclusion.** Protection must be an **authorization boundary in front of the
data**, which means real telemetry must **not be a public static asset at all**.
The only safe public payload is one that is harmless when fully public.

### 2.3 The two-contract boundary (replaces the single `/telemetry/*.json` idea)

- **Public contract — `public/telemetry/*.json`.** Demo-safe only: synthetic or
  irreversibly-aggregated, recruiter-safe. Every record carries `state` and
  `provenance` (§3, §5). **The static site reads nothing else.**
- **Private contract — future, separate.** Real telemetry behind server-side
  authz. **Never in this repo, never a static asset.** Phase 1 only *names* this
  boundary; it builds none of it.

### 2.4 Panel allow-matrix per mode

| Panel | Public / recruiter (static) | Private / internal (future, authed) |
| --- | --- | --- |
| Volatility Topology | ALLOWED on an **illustrative/standard** universe; public-derivable or synthetic IV substrate | real universe |
| Flight Recorder | ALLOWED as **coarse shell only** (liveness/health; "gate fired" as a *state*), demo-synthetic | real event stream |
| Research Ledger | ALLOWED as **methodology/lifecycle shell only** (pre-registration -> gate -> killed / kept-provisionally / promoted, as *process*); one DEMO_SYNTHETIC exemplar; **zero counts** | real ledger |
| Coverage / substrate | ALLOWED as demo-synthetic aggregate percentage | real coverage |
| Watchlists, P/L, trade rows, projections, contract inputs, private research logs | **FORBIDDEN** — payload-empty `GATED / LOGIN REQUIRED` placeholder only | the real data lives here |

The security model **resolves** the prior Research-Ledger tension: the real,
numeric ledger moves entirely into the private tier. Public gets only its
methodology shell plus a gated placeholder.

### 2.5 Forbidden from public static export (the no-fly list)

Never committed to the public repo, never a static asset, never reconstructable
from one:

- Real trade rows / fills / P/L / positions / holdings.
- Real watchlists, contract inputs, projections.
- The real (non-illustrative) traded universe, and its size or identity.
- Strategy identities; per-strategy verdicts.
- **Quantified attrition**: kill-rate, count of candidates evaluated, throughput,
  trial count N (`CLAUDE.md` §1: attrition is **qualitative only**).
- Calibrated cost-model constants; kill/promotion thresholds; parameter weights;
  signal logic.
- Live execution flags; broker / data-source / account detail.
- Per-event timestamps or instruments at a granularity that fingerprints behavior.
- Private research logs.
- **Any field from which a forbidden value is reconstructable** (see 2.6).

### 2.6 Demo-safe aggregate rules

A field may ship publicly **only** if all of the following hold:

1. **Irreversible.** The aggregate cannot be inverted to recover underlying rows.
2. **Encodes no withheld quantity.** "Showing 3 of N survivors" reconstructs the
   kill-rate; a coverage percentage over the *real* universe reveals universe
   size; few-bucket histograms over real data de-anonymize. All forbidden.
   Aggregation is **not** automatically safe.
3. **Redaction = removal from the payload, never DOM-hiding.** A field blanked with
   `display:none`, blurred, or masked with `***` is still in the JSON. Redaction
   means the field is **absent from the exported bytes**.
4. **Provenance-stamped and labeled.** Carries `state` + `provenance`; if synthetic,
   the `DEMO_SYNTHETIC` label is **unmissable on the panel itself**, not a footnote.
5. **Decided before commit.** Synthetic-vs-real is settled before the asset is
   committed, never retrofitted, because shipped demo data is permanent (2.2.3).

### 2.7 Features requiring an authenticated backend/API (future, not Phase 1)

Every real telemetry feed; the real flight-recorder stream; the real research
ledger; real coverage/universe metrics; watchlists / P/L / trade rows / projections
/ contract inputs; private research logs; anything per-strategy or per-trade; and
the private cockpit deployment itself (server-side authz, sessions, audit).

### 2.8 Placeholder-panel contract

A `GATED / LOGIN REQUIRED` panel must be **provably empty of payload**: a static
label and (later) a link, with **zero embedded data**. It must not prefetch,
fetch-then-blur, or ship data with `display:none`. A future session must not
"helpfully" wire it to real data.

---

## 3. Panel-state taxonomy (the honesty instrument)

Every panel renders exactly one **state**, shown on the panel. States are never
faked and a missing field is never silently omitted.

| State | Meaning |
| --- | --- |
| `READY` | Real, cleared, recruiter-safe data is present and current. |
| `PARTIAL` | Some cleared data present; the panel declares what is absent. |
| `MISSING` | The data does not exist / is not available to this surface. Shown as missing, not invented. |
| `GATED` | Real data exists but requires the private authenticated tier; public shows a payload-empty placeholder (2.8). |
| `PROPRIETARY_REDACTED` | A value exists but is withheld by the boundary (`CLAUDE.md` §1); shown as redacted, never approximated. |
| `DEMO_SYNTHETIC` | The displayed data is synthetic, for demonstration only. Label is unmissable. |

Each record also carries **`provenance`**: `demo_synthetic` or
`cleared_recruiter_safe`. A panel with no honest state to show is `MISSING`, not a
plausible-looking guess. **A dashboard of invented numbers presented as real would
directly betray the system's "refuses self-deception" thesis; the taxonomy is what
prevents that.**

---

## 4. Panel-by-panel boundary triage

The named panels do **not** carry equal risk. Triage governs build order.

- **Volatility Topology — lowest risk; build first.** IV surface / skew /
  term-structure are public-derivable from option chains; showing the market
  *substrate* is not showing the edge. **Caveat:** the *actual* traded universe
  leaks the strategy domain, so this panel is safe only on an **illustrative /
  standard** universe (e.g. a broad, obvious index complex), `DEMO_SYNTHETIC` or
  public-derivable. This is also the **one** panel that could justify keeping a
  WebGL dependency (a 3D surface plot).
- **Flight Recorder — medium risk.** Coarse liveness/health and "gate fired" as a
  *state* are showable. Per-event granularity (timing, instruments, sizes) leaks.
  Build as coarse status buckets and presence/absence only.
- **Research Ledger — highest risk; not buildable publicly as numbers.** A
  ledger's instinct (counts, states, kill-rate) collides head-on with `CLAUDE.md`
  §1 (quantified attrition + strategy identities/verdicts withheld). Public version
  is a **methodology/lifecycle shell**: pre-registration -> gate -> killed /
  kept-provisionally / promoted as *process*, one anonymized `DEMO_SYNTHETIC`
  exemplar, **zero aggregate counts**. The real ledger is private/`GATED`.
- **Coverage / substrate — medium.** Aggregate percentage only, `DEMO_SYNTHETIC`
  for public; the real coverage panel is `GATED`. Must not encode universe size
  (2.6.2).

---

## 5. Telemetry JSON contract (public, demo-safe)

- **Location:** `public/telemetry/*.json`. Allowlisted (`dir:public/:... json`).
- **Per record:** an explicit `state` (§3) and `provenance`
  (`demo_synthetic | cleared_recruiter_safe`). A record whose data is unavailable
  is emitted **with** a `MISSING` / `GATED` state, never omitted, never faked.
- **No runtime network.** The site fetches nothing live; consistent with today's
  zero-network posture (verified: no `fetch` / XHR / WebSocket in the codebase).
  No database queries, no engine calls from the frontend, ever.
- **Real contract is out of scope for Phase 1.** It targets the private
  storage/API boundary (2.3), is never a static asset, and is specified in a
  separate future doc, not here.

---

## 6. Boundary taxonomy extension (extends `CLAUDE.md` §1 to telemetry)

`CLAUDE.md` §1's SHOWABLE / WITHHOLD lists were written for *metaphor* and do not
yet cover telemetry categories. This section extends them. **It is the primary
safety deliverable of the pivot** and its items are added to
`docs/EDITORIAL_CHECKLIST.md` before any panel ships.

**SHOWABLE (telemetry additions) — safe when demo-safe / aggregate / illustrative:**
- Coarse system liveness (up / running / idle) as a *state*, synthetic or heavily
  coarsened.
- Published-principle methodology as process (pre-registration, gating, out-of-
  sample logic, cost-survival adjustment and overfitting-deflation **as named
  principles**, per §1) — the lifecycle, not the parameters.
- IV surface / skew / term-structure on an **illustrative** universe.
- **Qualitative** attrition only ("most do not survive"), never a number.
- Clearly-labeled `DEMO_SYNTHETIC` exemplars.

**WITHHOLD (telemetry additions) — never in public static output:**
- The full no-fly list (2.5), restated as boundary law.
- Any per-strategy, per-trade, or per-candidate record.
- The real traded universe (identity or size).
- Any aggregate from which a withheld quantity is reconstructable (2.6.2).
- Real coverage/throughput numbers; real timing/instrument granularity.

When a telemetry idea sits ambiguously across the line: **withhold, and flag Max**
(`CLAUDE.md` §1 asymmetry).

---

## 7. Data-substrate manifest (a REQUEST to Max, not an assessment)

**Hard rule.** The research engine's private repository is **never read from
this authoring context** (`CLAUDE.md` §1 rule zero). Therefore **nothing here can
be marked `READY` from the Katabasis side.** From inside this repo, *every* field
below is currently `MISSING` (verified: no telemetry substrate, no `data/`, no
non-config JSON in the repo).

The table is the **manifest Katabasis requests from Max**, as a deliberately
cleared, aggregated export (never a live connection). Real availability is filled
in **by Max against the engine's own systems**, never by a session inspecting that repo.

| Category requested | Cockpit use | Boundary note | Status *from here* |
| --- | --- | --- | --- |
| System state / liveness | Flight Recorder | coarse only; no per-event detail | MISSING (request) |
| Validation gate pass/fail | Ledger lifecycle | pass/fail as *process*; no thresholds/numbers | MISSING (request) |
| Coverage metrics | Coverage panel | aggregate % only; nothing that reveals universe | MISSING (request) |
| Research ledger entries | Ledger | mostly **GATED**: counts/kill-rate/identities withheld; lifecycle states only | MISSING / GATED |
| Universe summaries | Topology context | leaks strategy domain; **illustrative universe only** | MISSING / GATED |
| Friction / spread aggregates | Cost story | aggregate, anonymized; no calibrated constants | MISSING (request) |
| Outcome registry coverage | Substrate completeness | coverage %, not outcomes themselves | MISSING (request) |
| IV / chain / bid-ask / mark availability | Volatility Topology | public-derivable substrate safe; real universe not | MISSING (request) |

The instruction "if a field is not available, label it missing or gated, do not
invent numbers" is satisfied by this being the **default** state of the contract.

---

## 8. Reuse / archive ledger

**Carries forward (reuse):**
- Safety scaffolding: `.allowlist`, `.githooks/pre-commit` + `allowlist-check.sh`,
  the sealed Vite build (`sourcemap: false`), the CI allowlist backstop in
  `.github/workflows/deploy.yml`. **Mature, correct, and more important now.**
- Static deploy pipeline: Vite -> `dist/` -> GitHub Pages -> `katabasis.rip`
  (`public/CNAME`).
- `zustand` state pattern; the austere visual register; `docs/EDITORIAL_CHECKLIST.md`;
  `CLAUDE.md` §1-§2.

**Archived at `archive/estate-world` (preserved, not deleted):**
- `src/world/*`, `src/engine/*` (Rapier, Player, Colliders, PhysicsWorld),
  `src/minigame/*`, `src/inspect/*`, `src/audio/*`, the estate render stack
  (`estateMaterial.js`, `estateMaterials.js`, `matcaps.js`, `treatments.js`),
  the Blender pipeline (`blender/`, `procedural/`), and `harness/*`.

**three.js / R3F — separate the dependency from the code.**
- The **dependency** could power exactly one panel (Volatility Topology is a 3D
  surface plot). Keep it only if that panel is built.
- The **estate render code is dead weight.** Matcap maps *surface normal ->
  baked candlelight value*; a vol surface maps *data value -> colormap*. Orthogonal.
  "Reuse R3F" is true for the import line and false for everything beneath it.

---

## 9. Migration strategy: archive, do not refactor

Build the cockpit shell **fresh**, importing the scaffolding; do not mutate the
world into a dashboard. The two share almost no surface area except the
scaffolding, so an in-place refactor would be slower and riskier than a clean
shell. The estate is never deleted; it is superseded only once a cockpit has
earned the default route, and even then it is archived, not removed.

---

## 10. Phase 1 scope fence

**Phase 1 IS:** a public, fully-static cockpit shell; the demo-safe
`public/telemetry/*.json` contract; the panel-state taxonomy (§3); the boundary
taxonomy extension (§6) wired into the editorial checklist; and a small number of
**lowest-risk** panels (Volatility Topology on an illustrative universe; a coarse
status/coverage shell), all strictly read-only and `DEMO_SYNTHETIC`-labeled.

**Phase 1 IS NOT:** any backend, any authentication, any real telemetry, the
private cockpit, or any panel showing per-strategy / per-trade data. Those are
named here and deferred to a separate private-cockpit design doc.

---

## 11. Next implementation sequence (proposed; each independently reviewable)

1. **This doc** (committed on `pivot/cockpit`).
2. **Editorial checklist extension** — fold §6's SHOWABLE/WITHHOLD telemetry items
   into `docs/EDITORIAL_CHECKLIST.md` (safety apparatus before any panel).
3. **The public telemetry JSON contract + a `DEMO_SYNTHETIC` fixture** — a
   committed, schema-validated, obviously-synthetic sample with `state` +
   `provenance` on every record. No panels yet; the data spine others bind to.
4. **One static shell panel against the synthetic data** — the lowest-risk panel
   (a status/coverage grid), DOM/SVG, read-only, `DEMO_SYNTHETIC` banner
   unmissable. Proves shell + contract + safety labeling end to end before breadth.
5. **Volatility Topology** as the first richer panel (decide WebGL-vs-SVG on its
   own merits), on an illustrative universe.

Stack for the shell (Astro vs hand-authored static) is deferred and reversible
(`CLAUDE.md` §6 criterion); decided once the shell's surface count is known.

---

## 12. Open decisions (Max's call)

- **Frozen copy (`CLAUDE.md` §5 / `src/copy.js`)** as an about/manifesto layer in
  the cockpit: keep, adapt, or retire. Not required for Phase 1.
- **Disposition of `creative/fixture-profiles`** (the orphaned, unapproved fixture
  pass): revisit later, or abandon. Outside this doc's scope.
- **Private cockpit** hosting, authz model, and contract: a **separate future
  doc**, not started in Phase 1.

---

*Planning only. The next step is the editorial-checklist extension (or the JSON
contract), not UI. No backend, no auth, until explicitly planned and approved.*
