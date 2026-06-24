// Asset-handoff loaders for hand-modeled .glb files.
// ---------------------------------------------------------------------------
// One singleton GLTFLoader, wired for the two compression schemes a Blender
// export uses: Draco geometry compression and KTX2 (Basis) textures. The
// decoder runtimes are served LOCALLY from /public (no CDN), so the build stays
// sealed and works offline. See docs/ASSET_PIPELINE.md for the export spec.
//
// Two ways to load the same glb, both pointed at the same local decoders:
//   - loadGLB(url)      standalone async helper -> returns the gltf scene.
//   - drei useGLTF      React/Suspense path used by ExternalModel.jsx. drei
//                       owns its own GLTFLoader, so it cannot share this one;
//                       instead it reuses the KTX2Loader singleton below via
//                       getKTX2() and is given the SAME '/draco/' path. See the
//                       drei snippet at the bottom of this file.
//
// KTX2Loader needs the live WebGLRenderer to pick a GPU-supported transcode
// target. The app (or ExternalModel) calls setRenderer(gl) once; it is
// idempotent, so calling it from several places is safe.

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'

// Local decoder paths. These folders are copied from three's bundled runtimes
// (node_modules/three/examples/jsm/libs/{draco,basis}) into /public so they
// resolve at the site root with no network egress.
export const DRACO_PATH = '/draco/'
export const KTX2_PATH = '/basis/'

let _draco = null
let _ktx2 = null
let _gltf = null
let _ktx2Initialized = false

// Singleton DRACOLoader at the local decoder path.
function getDraco() {
  if (_draco) return _draco
  _draco = new DRACOLoader().setDecoderPath(DRACO_PATH)
  return _draco
}

// Singleton KTX2Loader at the local transcoder path. Shared by BOTH the
// standalone GLTFLoader here and drei's GLTFLoader (via getKTX2() in
// ExternalModel), so there is one transcoder worker pool for the whole app.
export function getKTX2() {
  if (_ktx2) return _ktx2
  _ktx2 = new KTX2Loader().setTranscoderPath(KTX2_PATH)
  return _ktx2
}

// Wire the renderer into the KTX2 transcoder. Required before any KTX2-textured
// glb is decoded; without it KTX2Loader throws
// "Missing initialization with .detectSupport()". Idempotent: detectSupport
// runs at most once, so this is safe to call from the app AND from every
// ExternalModel mount.
export function setRenderer(gl) {
  if (_ktx2Initialized || !gl) return
  getKTX2().detectSupport(gl)
  _ktx2Initialized = true
}

// True once a renderer has been supplied. ExternalModel guards on this so a
// KTX2 glb cannot transcode before the GPU target is known.
export function rendererReady() {
  return _ktx2Initialized
}

// Singleton GLTFLoader with Draco + KTX2 attached. Used only by loadGLB; drei
// builds its own loader for the React path.
function getGLTFLoader() {
  if (_gltf) return _gltf
  _gltf = new GLTFLoader()
  _gltf.setDRACOLoader(getDraco())
  _gltf.setKTX2Loader(getKTX2())
  return _gltf
}

// Async load. Resolves to the gltf scene (a THREE.Group). Rejects on 404 / parse
// error so the caller can decide; ExternalModel wraps this kind of failure in an
// error boundary. Throws early with a clear message if a KTX2-textured asset is
// loaded before setRenderer(gl) has run.
export async function loadGLB(url) {
  const loader = getGLTFLoader()
  const gltf = await new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject)
  })
  return gltf.scene
}

// Convenience for the standalone path when the full gltf (animations, cameras)
// is wanted rather than just the scene.
export async function loadGLTF(url) {
  const loader = getGLTFLoader()
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject)
  })
}

// drei integration, documented as the contract for ExternalModel / BakedHall:
//
//   import { useThree } from '@react-three/fiber'
//   import { useGLTF } from '@react-three/drei'
//   import { setRenderer, getKTX2 } from '../render/loaders.js'
//
//   const gl = useThree((s) => s.gl)
//   setRenderer(gl)  // idempotent; before useGLTF so KTX2 can transcode
//   const { scene } = useGLTF(
//     url,
//     DRACO_PATH,                               // 2nd arg overrides drei's CDN default
//     undefined,                                // useMeshopt (drei default is fine)
//     (loader) => loader.setKTX2Loader(getKTX2()) // 4th arg: extendLoader, wires KTX2
//   )
//
// The 2nd positional arg to useGLTF sets DRACO's decoder path locally (drei
// otherwise defaults Draco to a gstatic CDN, which the sealed build forbids).
// The 4th arg runs on drei's GLTFLoader and attaches our shared KTX2Loader.
