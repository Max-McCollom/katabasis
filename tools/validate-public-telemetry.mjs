#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const fixturePath = resolve('public/telemetry/demo_cockpit_snapshot.json')

const VALID_STATES = new Set([
  'READY',
  'PARTIAL',
  'MISSING',
  'GATED',
  'PROPRIETARY_REDACTED',
  'DEMO_SYNTHETIC',
])

const REQUIRED_SAFETY_FLAGS = [
  'contains_real_telemetry',
  'contains_real_p_l',
  'contains_trade_rows',
  'contains_watchlists',
  'contains_contract_inputs',
  'contains_strategy_identities',
  'contains_thresholds',
  'contains_parameter_weights',
  'contains_trigger_logic',
  'contains_live_execution_flags',
  'contains_kill_rates',
  'contains_candidate_counts',
  'contains_reconstructable_private_values',
]

const FORBIDDEN_PANEL_KEYS = [
  'p_l',
  'pnl',
  'profit',
  'loss',
  'trade_rows',
  'watchlist',
  'contract_inputs',
  'strategy_identity',
  'threshold',
  'parameter_weight',
  'trigger_logic',
  'live_execution',
  'kill_rate',
  'candidate_count',
  'position',
  'holding',
]

const failures = []

function fail(message) {
  failures.push(message)
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key)
}

function normalizeKey(key) {
  return key.toLowerCase()
}

function matchesForbiddenKey(key) {
  const normalized = normalizeKey(key)
  return FORBIDDEN_PANEL_KEYS.some((forbidden) => normalized === forbidden || normalized.includes(forbidden))
}

function inspectPanelKeys(value, path) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectPanelKeys(item, `${path}[${index}]`))
    return
  }

  if (!isPlainObject(value)) return

  for (const [key, nested] of Object.entries(value)) {
    if (matchesForbiddenKey(key)) {
      fail(`${path}.${key} uses forbidden public telemetry payload key "${key}"`)
    }
    inspectPanelKeys(nested, `${path}.${key}`)
  }
}

let snapshot
try {
  const raw = await readFile(fixturePath, 'utf8')
  snapshot = JSON.parse(raw)
} catch (error) {
  fail(`Could not read or parse ${fixturePath}: ${error.message}`)
}

if (snapshot) {
  if (snapshot.mode !== 'PUBLIC_DEMO') fail('mode must be "PUBLIC_DEMO"')
  if (snapshot.provenance !== 'DEMO_SYNTHETIC') fail('top-level provenance must be "DEMO_SYNTHETIC"')
  if (!snapshot.schema_version) fail('schema_version is required')
  if (!isPlainObject(snapshot.public_safety)) fail('public_safety object is required')
  if (!isPlainObject(snapshot.panels)) fail('panels object is required')

  if (isPlainObject(snapshot.public_safety)) {
    for (const flag of REQUIRED_SAFETY_FLAGS) {
      if (snapshot.public_safety[flag] !== false) {
        fail(`public_safety.${flag} must be false`)
      }
    }
  }

  if (isPlainObject(snapshot.panels)) {
    for (const [panelName, panel] of Object.entries(snapshot.panels)) {
      const panelPath = `panels.${panelName}`

      if (!isPlainObject(panel)) {
        fail(`${panelPath} must be an object`)
        continue
      }

      if (!hasOwn(panel, 'state')) {
        fail(`${panelPath}.state is required`)
      } else if (!VALID_STATES.has(panel.state)) {
        fail(`${panelPath}.state must be one of ${Array.from(VALID_STATES).join(', ')}`)
      }

      if (!hasOwn(panel, 'provenance')) {
        fail(`${panelPath}.provenance is required`)
      }

      if (panel.state === 'GATED' && panel.payload !== null) {
        fail(`${panelPath} is GATED and must have payload === null`)
      }

      inspectPanelKeys(panel, panelPath)
    }
  }
}

if (failures.length) {
  console.error('FAIL public telemetry validation')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('PASS public telemetry validation: demo fixture is schema-safe and public-safe')
