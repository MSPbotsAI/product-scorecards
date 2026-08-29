// Regenerate service/snapshots/intake.ts from the ATI docs repo.
//
// Why a committed snapshot rather than a live read: the pipeline rung and its evidence are assigned
// BY HAND from meeting notes and email (the upstream builder's own `meta.stage_caveat` says keyword
// matching was rejected as too error-prone — "declined the paid apps" reads as a customer refusal).
// There is no dataset to query for that judgement, so the honest options are a dated snapshot or
// nothing. This is the snapshot, and every page that renders it shows `asOf` so it can never pass
// itself off as live.
//
// Usage:
//   node scripts/build-intake-snapshot.mjs [--source <path>] [--as-of YYYY-MM-DD]
//
// `--as-of` pins the evaluation date. Everything time-relative in the report (elapsed-week
// denominators, whether a scheduled slot has quietly gone by) is derived from it, so pinning it is
// what makes the numbers reproducible instead of drifting with the clock. Defaults to the source
// file's last-modified date — i.e. when the data was actually refreshed.

import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const DEFAULT_SOURCE =
  '/Users/noahbombom/AIcursor/ai after hours call/AI-after-hours-call-docs/timeline/intake-client-meetings.json'

function arg(name, fallback) {
  const i = process.argv.indexOf(name)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

const sourcePath = arg('--source', DEFAULT_SOURCE)
const raw = JSON.parse(readFileSync(sourcePath, 'utf8'))

const asOf = arg('--as-of', statSync(sourcePath).mtime.toISOString().slice(0, 10))
if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new Error(`--as-of must be YYYY-MM-DD, got ${asOf}`)

// Sanity-check the shape before writing: a silently truncated or restructured upstream file must
// fail here, not render as an empty report on the platform.
if (!Array.isArray(raw.clients) || raw.clients.length === 0) throw new Error('source has no clients[]')
if (!raw.meta?.window?.from || !raw.meta?.window?.to) throw new Error('source has no meta.window')
if (!raw.meta?.stages || !raw.meta?.states) throw new Error('source has no meta.stages / meta.states')
for (const c of raw.clients) {
  if (!c.name || !c.stage || !c.track) throw new Error(`client missing name/stage/track: ${c.name ?? '(unnamed)'}`)
  if (!raw.meta.stages[c.stage]) throw new Error(`${c.name}: unknown stage "${c.stage}"`)
  for (const e of c.events ?? []) {
    if (!raw.meta.states[e.state]) throw new Error(`${c.name}: unknown event state "${e.state}"`)
  }
}

const snapshot = {
  asOf,
  /** What the upstream file itself claimed when it was written — kept so the two can be compared. */
  sourceGeneratedFor: raw.meta.generated_for ?? null,
  source: sourcePath.split('/').slice(-2).join('/'),
  meta: raw.meta,
  clients: raw.clients,
  roleActions: raw.role_actions ?? [],
  openQuestions: raw.open_questions ?? [],
  openQuestionsEn: raw.open_questions_en ?? [],
}

// U+2028/U+2029 are legal in JSON strings but were not legal in JS source before ES2019. The bundle
// targets node22, so this is belt-and-braces against an older downstream parser.
const literal = JSON.stringify(snapshot, null, 1)
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029')

const out = `// GENERATED FILE — do not edit by hand.
//
// Regenerate:  node scripts/build-intake-snapshot.mjs --as-of ${asOf}
// Source:      ${snapshot.source}
// as of:       ${asOf}
//
// A dated, hand-curated snapshot of the AI Ticket Intake client-engagement report. See
// scripts/build-intake-snapshot.mjs for why this is a snapshot and not a live dataset read.

import type { RawSnapshot } from '../lib/intake-source.ts'

export const INTAKE_SNAPSHOT: RawSnapshot = ${literal}
`

const target = join(root, 'service/snapshots/intake.ts')
writeFileSync(target, out, 'utf8')

const counts = raw.clients.reduce((acc, c) => ({ ...acc, [c.track]: (acc[c.track] ?? 0) + 1 }), {})
console.log(`wrote ${target}`)
console.log(
  `  as of ${asOf} · ${raw.clients.length} clients (${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')})` +
    ` · ${raw.clients.reduce((n, c) => n + (c.events?.length ?? 0), 0)} meetings` +
    ` · ${snapshot.roleActions.reduce((n, r) => n + (r.items?.length ?? 0), 0)} follow-ups` +
    ` · ${snapshot.openQuestions.length} open questions` +
    ` · ${(out.length / 1024).toFixed(0)} KB`,
)
