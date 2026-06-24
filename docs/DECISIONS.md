# Decision log: the immersive 3D build

Running log of load-bearing choices for the free-roam 3D estate. Newest first.

## Environment realities (verified this session)
- **Blender is not installed** (no PATH binary, no .app). The headless Blender
  Python pipeline (procedural geometry, UV2 unwrap, lightmap/AO bake, glTF
  export) is therefore not available this run.
- **Cascade:** no authored `.glb` -> the KTX2 / Draco / gltf-transform / draw-
  call-budget / 5 MB-asset pipeline is moot this run and is intentionally NOT
  built. Geometry is generated procedurally in code; shading is matcap-based
  (Bruno Simon's "rendering illusion": no real-time lights). This is deliberate
  scoping forced by the environment, not a silent shortfall.
- Chrome present (screenshot harness), Node 24, npm registry reachable.

## The spine: a verified visual loop
- The harness must run on the **real GPU**, not software WebGL. Critiques of
  Piranesi/Dore chiaroscuro, bloom, exposure and warm grade are only valid on
  hardware. First harness run records `UNMASKED_RENDERER_WEBGL`; if it reads
  SwiftShader/llvmpipe, all colour/tone judgments are flagged provisional for
  Max's real-hardware eye.
- The loop judges LOOK / COMPOSITION / LIGHT only. Motion feel, camera inertia
  and audio cannot be judged from stills: those are built to known-good
  patterns, wired to a live GUI, and handed to Max with a flag.

## Stack
- React + R3F as specified. `leva` is used as the live-tuning GUI: it is the
  R3F-idiomatic equivalent of lil-gui (same purpose, better React integration).
  Flagged as the one substitution from the named stack.
- No external runtime assets: matcaps are generated procedurally (canvas
  gradients), shaders inlined. Self-contained and boundary-safe.

## Reachable bar (honest)
- Procedural + matcap + atmosphere reaches an **evocative stylized homage** that
  reads the references (Piranesi scale-into-dark, Dore single-source chiaroscuro,
  Moreau gold-and-dark). It will **not** reach hand-sculpted engraving-density
  surface detail; that shortfall is named, not chased.
- Effort weighted to reachable high-impact levers: fog falloff to black, single-
  source matcap light pools + baked shadow planes, the warm gold-and-dark
  palette, composition for impossible scale, instanced repeated ornament for
  density, and uncanny spatial connections.

## Graceful-failure order
room-look (relentless loop) -> movement/collision -> inspect + one minigame ->
audio + mobile. If the run stops early it still yields {runnable build + one
iterated room + honest report}, never {great plumbing, nothing rendering}.

## Boundary
Abstract/atmospheric only. Frozen copy surfaced verbatim (copy lives in
`src/copy.js`; verbatim check adapted there). Nothing proprietary.

## Phase: Bruno study + Blender bake pipeline

### Adopted from brunosimon/folio-2019 (studied via the public repo)
- **Indirect tint (the lighting illusion).** Bruno's matcap blends toward a warm
  `uIndirectColor` (#d04500) by `distanceTerm * angleTerm`, where distance =
  height above floor and angle = how much the normal faces DOWN. We adopted the
  down-facing-normal term into our fake-bounce (`src/render/estateMaterial.js`):
  warm bounce now concentrates on down-facing soffits near the floor (under
  capitals, beams, arch undersides) as real radiosity would.
- **Camera:** Bruno's per-tick lerp (`easing 0.15/0.1/0.1`) is frame-rate
  DEPENDENT (no dt term). Ours already uses `1 - exp(-k*dt)`, which is the exact
  fix his lacks; kept ours.
- **Reveal:** his click-gated geometry-rises-from-floor reveal (single 0->1 GSAP
  uniform, sub-floor discard) is noted as a future upgrade to our veil+settle.
- Honest: the repo is the shipped ENGINE/shaders, NOT the Blender modeling
  source; the hand-built art lived in .blend files, not the code.

### Blender pipeline (Blender 5.1.2, headless, OPERATES)
- `blender/build_hall.py` generates the colonnade procedurally (fluted columns,
  bases, capitals, entablature, voussoir arches, floor, walls) at the layout.js
  coordinates, smart-UV + lightmap-pack UV2, bakes in Cycles, exports glb.
- Two bakes: COMBINED (albedo x candle GI x AO -> the dramatic look) and a pure
  AO pass. ~20s at 256 samples / 2048 lightmap.
- gltf-transform: Draco geometry + WebP textures -> **972 KB to 74 KB (13x)**.
- **KTX2 gap (honest):** `toktx` / KTX-Software is not installed, so KTX2
  (ETC1S/UASTC) encoding is unavailable; WebP is used as the texture fallback.
  Fix: `brew install ktx` (or download KTX-Software), then `gltf-transform` can
  emit KTX2.
- **Baked-vs-matcap verdict (honest):** baked GI gives real Dore chiaroscuro +
  AO and clearly beats matcap for establishing/dramatic views (see before/after
  shots, ?baked). At the visitor's eye-level POV the DIRECTIONAL baked light
  reads darker than the omnidirectional matcap (grazing angles, inherent). So
  the default keeps the (now indirect-tint-improved) matcap for readability;
  the baked hall is wired and demonstrated via `?baked`. Baked-as-universal-
  default needs the Blender candle light-rig tuned for eye-level readability:
  a tuning pass, not a pipeline gap.
