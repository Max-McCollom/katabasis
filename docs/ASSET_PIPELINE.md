# Asset pipeline: hand-modeled glb handoff

The contract for dropping a Blender-authored `.glb` into the scene. A model
exported to this spec loads through the existing loader with no code changes.

## Where assets live

- Models: `public/models/`
- Local decoder runtimes (already copied, do not move): `public/draco/`,
  `public/basis/`. Served at the site root; no CDN, no network egress.

## How to drop a model in

1. Export from Blender to `public/models/NAME.glb` (spec below).
2. Reference it:
   ```jsx
   <ExternalModel url="/models/NAME.glb" position={[0, 0, -30]} />
   ```
   `position`, `rotation` (radians), and `scale` are optional props. A missing
   file does not crash the app: the slot renders empty and logs a warning.

That is the whole handoff. The same loader (`src/render/loaders.js`,
`src/world/ExternalModel.jsx`) handles Draco geometry and KTX2 textures.

## Coordinate convention

- three.js is **Y-up**. Apply all transforms in Blender before export (Blender
  is Z-up; the glTF exporter converts, so author with `+Y up` selected).
- **Floor sits at `y = 0`.** Model with the base resting on the ground plane.
- **The hall runs down `-Z`.** The threshold is near `z = 0`; deeper into the
  hall is more negative Z. A model placed "down the hall" sits at negative Z
  (e.g. `position={[0, 0, -30]}`). Positive Z is behind the entrance.
- Default facing: model's front toward `+Z` (toward the viewer at the
  threshold), so an unrotated asset faces someone walking in.

## Blender glTF export spec

Geometry
- **Apply transforms** (location, rotation, scale) before export. No parent
  empties carrying transforms.
- **+Y up.**
- Keep **< 40k triangles per object**. Split anything heavier.
- Provide a **second UV channel for lightmaps** (UV2). Name it consistently
  (e.g. `UVMap` for the texture set, `Lightmap` / `UV2` for the bake channel) so
  the baker and loader agree.

Compression
- **Draco** geometry compression on (glTF exporter -> Compression).
- **KTX2** textures: **ETC1S** for color/albedo maps (small), **UASTC** for
  normal maps (precision). Convert PNG/JPG sources to `.ktx2` (e.g. with
  `toktx` / `gltf-transform`) and reference them from the glb.

Colliders (optional, for later Rapier physics)
- Prefix collision meshes with **`col_`** (e.g. `col_floor`, `col_wall`). The
  convention lets a later pass split `col_*` meshes into Rapier colliders and
  hide them from render. Keep collision geometry coarse and convex where
  possible.

Naming
- Mesh and object names are stable identifiers. Keep them meaningful and
  ASCII; avoid spaces.

## Decoder runtimes (reference)

Copied once from `node_modules/three/examples/jsm/libs/`:
- `draco/` (incl. `gltf/` subfolder) -> `public/draco/` (Draco decoder, served
  at `/draco/`).
- `basis/` -> `public/basis/` (Basis/KTX2 transcoder, served at `/basis/`).

`loaders.js` points DRACOLoader at `/draco/` and KTX2Loader at `/basis/`.
KTX2Loader requires the live `WebGLRenderer` to choose a GPU transcode target;
`setRenderer(gl)` supplies it once (idempotent). `ExternalModel` calls this
itself, so KTX2 assets are safe even when the model is the only thing rendering.

## Commit note (allowlist)

`public/draco/` and `public/basis/` contain `.js` and `.wasm` files. The repo
`.allowlist` currently permits `.glb .gltf .bin .hdr .ktx2 ...` under `public/`
but **not** `js` or `wasm`, so the pre-commit hook will reject these decoder
files. Adding an allowlist line is a deliberate act (see the build brief). To
ship the decoders, add `js wasm` to the `dir:public/:` line in `.allowlist`.
Until then the decoders work in local dev (the allowlist is a git gate, not a
serve gate) but cannot be committed. Flagged for Max.
