// AI Ticket Intake — client engagement, derived for the browser.
//
// Source: a dated snapshot (service/snapshots/intake.ts), not a live dataset. The pipeline rung
// is a human judgement, so there is nothing to query; see scripts/build-intake-snapshot.mjs.
//
// This file is the executable mirror of the upstream Python builder
// (AI-after-hours-call-docs/scripts/build_intake_timeline.py). The three computations that must stay
// identical to it, because the published report quotes them:
//
//   1. Average progress is over LIVE clients only (pct > 0). Lost deals are 0% and would drag a
//      "how far along is the book" number toward zero for the wrong reason.
//   2. The held-rate denominator counts held + cancelled + norecord ("we said we'd meet"). It
//      excludes `noinvite` — you cannot no-show a meeting that was never sent — and `upcoming`.
//   3. Weekly reach averages over ELAPSED weeks only, and counts a client once per week however
//      many sessions it had. A future week with no meetings is not a quiet week; it hasn't happened.
//
// Change any of them here and the app stops agreeing with the report it came from.

import { INTAKE_SNAPSHOT } from '../snapshots/intake.ts'
import type { RawClient, RawEvent, RawSnapshot } from './intake-source.ts'

/** Meeting states that represent an intent to meet — the held-rate denominator. */
const COUNTED = new Set(['held', 'cancelled', 'norecord'])

/** Rungs at or above MSP self-test: the client is doing real work in the product, not just talking. */
const DEEP_PCT = 55

/* ── dates ── */

const parse = (s: string): Date => new Date(`${s}T00:00:00Z`)
const iso = (d: Date): string => d.toISOString().slice(0, 10)

/** Monday of the week containing `d`, in UTC. Weeks start Monday, matching the scorecard. */
function monday(d: Date): Date {
  const out = new Date(d)
  // getUTCDay(): Sunday = 0, so Sunday belongs to the week that began six days earlier.
  out.setUTCDate(out.getUTCDate() - ((out.getUTCDay() + 6) % 7))
  return out
}

const addDays = (d: Date, n: number): Date => {
  const out = new Date(d)
  out.setUTCDate(out.getUTCDate() + n)
  return out
}

const daysBetween = (a: Date, b: Date): number => Math.round((b.getTime() - a.getTime()) / 86_400_000)

/* ── browser-facing shape ── */

export interface IntakeEvent {
  date: string
  time: string | null
  state: string
  title: string | null
  reason: { zh: string; en: string } | null
  note: { zh: string; en: string } | null
  /** Fathom recording, when the session was recorded. */
  href: string | null
  /** Vanished from the calendar with no cancellation on record. */
  silent: boolean
}

export interface IntakeClient {
  /** Stable id for React keys and detail links; derived from the name. */
  slug: string
  name: string
  track: string
  stage: string
  /** Ladder progress 0–100, from the stage. */
  pct: number
  stageLabel: { zh: string; en: string }
  contact: string | null
  status: string | null
  cadence: { zh: string; en: string } | null
  stageEvidence: { zh: string; en: string } | null
  nextAction: { zh: string; en: string } | null
  lostReason: { zh: string; en: string } | null
  /** For a lost deal: how they said no, and in their own words. */
  rejection: {
    channel: string | null
    date: string | null
    who: { zh: string; en: string } | null
    quote: { zh: string; en: string } | null
    ref: { zh: string; en: string } | null
  } | null
  note: { zh: string; en: string } | null
  /** One bucket per week column, aligned to `weeks`. */
  cells: IntakeEvent[][]
  /** Sessions actually held. */
  held: number
  /** held + cancelled + norecord — what was on the calendar. */
  planned: number
  /** Invites the cadence implies but the calendar never got. */
  missingInvites: number
  /** Date of the most recent held session at or before asOf. */
  lastMet: string | null
  /** Days from `lastMet` to asOf. Null when they have never been met. */
  daysSinceMet: number | null
}

export interface TrackReport {
  id: string
  label: { zh: string; en: string }
  desc: { zh: string; en: string }
  clients: IntakeClient[]
  /** Distinct clients met per elapsed week: mean, best week, weeks with nobody. */
  reach: { avg: number; peak: number; weeks: number; zero: number }
  held: number
  planned: number
}

export interface IntakeReport {
  asOf: string
  /** Days from asOf to the server's today — how stale the snapshot is right now. */
  ageDays: number
  source: string
  sourceGeneratedFor: string | null
  window: { from: string; to: string }
  /** Week-start Mondays, oldest first. Column headers for the meeting grid. */
  weeks: string[]
  /** Index into `weeks` of the last week that has actually elapsed. */
  elapsedWeeks: number
  tracks: TrackReport[]
  ladder: { key: string; pct: number; label: { zh: string; en: string }; desc: { zh: string; en: string }; count: number }[]
  states: Record<string, { label: { zh: string; en: string }; desc: { zh: string; en: string } }>
  summary: {
    clients: number
    /** Mean rung of the clients still alive — lost deals excluded. */
    avgProgress: number
    /** At MSP self-test or beyond. */
    deep: number
    lost: number
    /** Taking real caller traffic or won. The headline number: it is currently zero. */
    inProduction: number
    held: number
    planned: number
    /** held / planned, as a percentage. Alpha + prospect combined. */
    heldRate: number
    missingInvites: number
  }
  roleActions: {
    role: string
    subtitle: { zh: string; en: string }
    owners: { name: string; email: string | null; initials: string }[]
    items: {
      priority: { zh: string; en: string }
      title: { zh: string; en: string }
      why: { zh: string; en: string } | null
      action: { zh: string; en: string } | null
    }[]
  }[]
  method: {
    sources: { layer: { zh: string; en: string }; source: { zh: string; en: string }; detail: { zh: string; en: string } }[]
    /** Upstream files the report joins in, named so a number can be traced back to a file. */
    extraSources: { zh: string; en: string }[]
    /** The report's own caveats, rendered verbatim — they qualify every number above. */
    notes: { zh: string; en: string }[]
    openQuestions: { zh: string; en: string }[]
  }
}

/* ── helpers ── */

/** Resolve a bilingual pair, falling back to the Chinese when no translation exists. */
function pick(o: Record<string, unknown> | undefined, key: string): { zh: string; en: string } | null {
  const zh = o?.[key]
  if (zh == null || String(zh).length === 0) return null
  const en = o?.[`${key}_en`]
  return { zh: String(zh), en: en != null && String(en).length > 0 ? String(en) : String(zh) }
}

const pickOr = (o: Record<string, unknown> | undefined, key: string): { zh: string; en: string } =>
  pick(o, key) ?? { zh: '', en: '' }

function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  // Names are ASCII in this dataset, but a non-Latin name would slug to empty — fall back rather
  // than hand React a duplicate key.
  return s || encodeURIComponent(name)
}

/**
 * A slot scheduled for a date that has since passed is no longer "scheduled".
 *
 * Mirrors reclassify() upstream. Without it the grid keeps claiming a meeting is coming up long
 * after the date went by — the page would age into a lie. Downgrading it to "no record" turns the
 * staleness into a visible question instead.
 */
function reclassify(event: RawEvent, asOf: Date): { state: string; extraNote: { zh: string; en: string } | null } {
  if (event.state === 'upcoming' && parse(event.date) < asOf) {
    return {
      state: 'norecord',
      extraNote: {
        zh: '（原为已排期场次，日期已过但仍无录像或纪要——需要确认是否真的开了）',
        en: '(was a scheduled slot; the date has passed with no recording or notes — needs confirming)',
      },
    }
  }
  return { state: event.state, extraNote: null }
}

function toEvent(raw: RawEvent, asOf: Date): IntakeEvent {
  const { state, extraNote } = reclassify(raw, asOf)
  const note = pick(raw as unknown as Record<string, unknown>, 'note')
  const merged = extraNote
    ? { zh: [note?.zh, extraNote.zh].filter(Boolean).join(' '), en: [note?.en, extraNote.en].filter(Boolean).join(' ') }
    : note
  return {
    date: raw.date,
    time: raw.time ?? null,
    state,
    title: raw.title ?? null,
    reason: pick(raw as unknown as Record<string, unknown>, 'reason'),
    note: merged,
    href: raw.fathom ?? null,
    silent: Boolean(raw.silent),
  }
}

function toClient(raw: RawClient, snapshot: RawSnapshot, weeks: Date[], asOf: Date): IntakeClient {
  const stage = snapshot.meta.stages[raw.stage]
  const index = new Map(weeks.map((w, i) => [iso(w), i]))
  const cells: IntakeEvent[][] = weeks.map(() => [])

  let held = 0
  let planned = 0
  let missingInvites = 0
  let lastMet: string | null = null

  for (const rawEvent of raw.events ?? []) {
    const event = toEvent(rawEvent, asOf)
    const i = index.get(iso(monday(parse(event.date))))
    // An event outside the window is dropped from the grid but must not be counted either — a
    // denominator that includes invisible sessions cannot be checked against the picture.
    if (i === undefined) continue
    cells[i].push(event)

    if (event.state === 'held') {
      held++
      // "Last met" only counts sessions that have already happened.
      if (parse(event.date) <= asOf && (!lastMet || event.date > lastMet)) lastMet = event.date
    }
    if (COUNTED.has(event.state)) planned++
    if (event.state === 'noinvite') missingInvites++
  }

  return {
    slug: slugify(raw.name),
    name: raw.name,
    track: raw.track,
    stage: raw.stage,
    pct: stage?.pct ?? 0,
    stageLabel: pickOr(stage as unknown as Record<string, unknown>, 'label'),
    contact: raw.contact ?? null,
    status: raw.status ?? null,
    cadence: pick(raw as unknown as Record<string, unknown>, 'cadence'),
    stageEvidence: pick(raw as unknown as Record<string, unknown>, 'stage_evidence'),
    nextAction: pick(raw as unknown as Record<string, unknown>, 'next_action'),
    lostReason: pick(raw as unknown as Record<string, unknown>, 'lost_reason'),
    rejection: raw.rejection
      ? {
          channel: raw.rejection.channel ?? null,
          date: raw.rejection.date ?? null,
          who: pick(raw.rejection as unknown as Record<string, unknown>, 'who'),
          quote: pick(raw.rejection as unknown as Record<string, unknown>, 'quote'),
          ref: pick(raw.rejection as unknown as Record<string, unknown>, 'ref'),
        }
      : null,
    note: pick(raw as unknown as Record<string, unknown>, 'note'),
    cells,
    held,
    planned,
    missingInvites,
    lastMet,
    daysSinceMet: lastMet ? daysBetween(parse(lastMet), asOf) : null,
  }
}

/**
 * Distinct clients met per week, averaged over elapsed weeks only.
 *
 * A client counts once per week however many sessions it had — three calls with one account is not
 * the same reach as one call with three accounts.
 */
function weeklyReach(clients: IntakeClient[], elapsedWeeks: number): TrackReport['reach'] {
  if (elapsedWeeks <= 0) return { avg: 0, peak: 0, weeks: 0, zero: 0 }
  const perWeek: number[] = []
  for (let i = 0; i < elapsedWeeks; i++) {
    perWeek.push(clients.filter((c) => c.cells[i]?.some((e) => e.state === 'held')).length)
  }
  return {
    avg: perWeek.reduce((a, b) => a + b, 0) / perWeek.length,
    peak: Math.max(...perWeek),
    weeks: perWeek.length,
    zero: perWeek.filter((n) => n === 0).length,
  }
}

/* ── entry point ── */

export function buildIntakeReport(snapshot: RawSnapshot = INTAKE_SNAPSHOT): IntakeReport {
  const asOf = parse(snapshot.asOf)
  const { window } = snapshot.meta

  // The grid runs to at least two weeks past asOf so the near-term schedule (and anything that
  // should have been scheduled but wasn't) is visible rather than cropped off the right edge.
  const start = monday(parse(window.from))
  const end = new Date(Math.max(monday(parse(window.to)).getTime(), monday(addDays(asOf, 14)).getTime()))
  const weeks: Date[] = []
  for (let cur = start; cur <= end; cur = addDays(cur, 7)) weeks.push(cur)

  const cutoff = monday(asOf)
  const elapsedWeeks = weeks.filter((w) => w <= cutoff).length

  const clients = snapshot.clients.map((c) => toClient(c, snapshot, weeks, asOf))
  const byPct = (a: IntakeClient, b: IntakeClient) => b.pct - a.pct || a.name.localeCompare(b.name)

  const tracks: TrackReport[] = snapshot.meta.tracks.map((track) => {
    const members = clients.filter((c) => c.track === track.id).sort(byPct)
    return {
      id: track.id,
      label: pickOr(track as unknown as Record<string, unknown>, 'label'),
      desc: pickOr(track as unknown as Record<string, unknown>, 'desc'),
      clients: members,
      reach: weeklyReach(members, elapsedWeeks),
      held: members.reduce((n, c) => n + c.held, 0),
      planned: members.reduce((n, c) => n + c.planned, 0),
    }
  })

  const ladder = Object.entries(snapshot.meta.stages)
    .map(([key, stage]) => ({
      key,
      pct: stage.pct,
      label: pickOr(stage as unknown as Record<string, unknown>, 'label'),
      desc: pickOr(stage as unknown as Record<string, unknown>, 'desc'),
      count: clients.filter((c) => c.stage === key).length,
    }))
    .sort((a, b) => a.pct - b.pct)

  const states: IntakeReport['states'] = {}
  for (const [key, state] of Object.entries(snapshot.meta.states)) {
    states[key] = {
      label: pickOr(state as unknown as Record<string, unknown>, 'label'),
      desc: pickOr(state as unknown as Record<string, unknown>, 'desc'),
    }
  }

  const live = clients.filter((c) => c.pct > 0)
  const held = clients.reduce((n, c) => n + c.held, 0)
  const planned = clients.reduce((n, c) => n + c.planned, 0)

  // Verbatim caveats. These are the report's own qualifications of its numbers, so they travel with
  // it rather than living in a doc nobody opens next to the chart.
  const NOTE_KEYS = [
    'sla',
    'stage_note',
    'stage_caveat',
    'invite_rule',
    'rejection_note',
    'timezone_note',
    'ticket_scope_note',
    'ticket_match_note',
    'told_note',
    'link_note',
  ]

  return {
    asOf: snapshot.asOf,
    ageDays: Math.max(0, daysBetween(asOf, new Date())),
    source: snapshot.source,
    sourceGeneratedFor: snapshot.sourceGeneratedFor,
    window,
    weeks: weeks.map(iso),
    elapsedWeeks,
    tracks,
    ladder,
    states,
    summary: {
      clients: clients.length,
      avgProgress: live.length ? live.reduce((n, c) => n + c.pct, 0) / live.length : 0,
      deep: live.filter((c) => c.pct >= DEEP_PCT).length,
      lost: clients.filter((c) => c.pct === 0).length,
      inProduction: clients.filter((c) => c.stage === 'livecalls' || c.stage === 'won').length,
      held,
      planned,
      heldRate: planned ? (held / planned) * 100 : 0,
      missingInvites: clients.reduce((n, c) => n + c.missingInvites, 0),
    },
    roleActions: snapshot.roleActions.map((role) => ({
      role: role.role,
      subtitle: pickOr(role as unknown as Record<string, unknown>, 'subtitle'),
      owners: (role.owners ?? []).map((o) => ({
        name: o.name,
        email: o.email ?? null,
        initials: o.initials ?? o.name.slice(0, 2).toUpperCase(),
      })),
      items: (role.items ?? []).map((item) => ({
        priority: pickOr(item as unknown as Record<string, unknown>, 'pri'),
        title: pickOr(item as unknown as Record<string, unknown>, 'title'),
        why: pick(item as unknown as Record<string, unknown>, 'why'),
        action: pick(item as unknown as Record<string, unknown>, 'do'),
      })),
    })),
    method: {
      sources: (snapshot.meta.sources ?? []).map((s) => ({
        layer: pickOr(s as unknown as Record<string, unknown>, 'layer'),
        source: pickOr(s as unknown as Record<string, unknown>, 'source'),
        detail: pickOr(s as unknown as Record<string, unknown>, 'detail'),
      })),
      extraSources: ((snapshot.meta.data_sources_extra as string[]) ?? []).map((zh, i) => ({
        zh,
        en: ((snapshot.meta.data_sources_extra_en as string[]) ?? [])[i] ?? zh,
      })),
      notes: NOTE_KEYS.map((k) => pick(snapshot.meta, k)).filter((n): n is { zh: string; en: string } => n !== null),
      openQuestions: snapshot.openQuestions.map((zh, i) => ({ zh, en: snapshot.openQuestionsEn[i] ?? zh })),
    },
  }
}
