#!/usr/bin/env node
/**
 * Publish this app on the MSPbots platform and wait until the new code is actually serving.
 *
 * Contract observed 2026-09-16 (see kb / mspbots-publish-api-contract.md):
 *   POST /projects/{id}/publish  -> {"code":200,"data":{"jobId":"<uuid>","total":<tenants>}}
 *   GET  /migrations/{jobId}     -> {"code":200,"data":{"job":{status,done,total,error,finishedAt,...}}}
 *   statuses seen: building -> running -> success   (the FAILURE value has never been observed)
 *
 * Two things this gets right that a naive check does not:
 *   1. The API answers HTTP 200 even for errors — the real code is in the `code` field.
 *   2. Terminal state is detected by `finishedAt != null`, not by matching a status string,
 *      so an unobserved failure value still fails the build instead of hanging or passing.
 *
 * Env:
 *   MSPBOTS_TOKEN       required — platform bearer token with access to /api/publish/*
 *   MSPBOTS_PROJECT_ID  optional — defaults to the product-scorecards project
 *   EXPECT_SHA          optional — commit the deploy must end up running (default: git HEAD)
 *
 * Build logs for a failed pipeline, if you need them:
 *   GET {API}/projects/{projectId}/ci-log?tag={pipelineId}   (param is named `tag`, takes the pipelineId)
 */

import { execSync } from 'node:child_process'

const API = 'https://agent.mspbots.ai/apps/mb-platform-setting/api/publish'
const APP = 'product-scorecards'
const PROJECT_ID = process.env.MSPBOTS_PROJECT_ID || '81cd37b5-b148-44f8-90a6-e8da4ea3ee94'
const TOKEN = process.env.MSPBOTS_TOKEN

const POLL_INTERVAL_MS = 3_000
const FIRST_POLL_DELAY_MS = 1_500
const TIMEOUT_MS = 5 * 60_000 // observed run was 49s; 6x headroom

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const log = (...a) => console.log(...a)
const fail = (msg, body) => {
  console.error(`\n✗ ${msg}`)
  if (body !== undefined) console.error(typeof body === 'string' ? body : JSON.stringify(body, null, 2))
  process.exit(1)
}

/** Every platform response is HTTP 200; the envelope `code` is the real status. */
async function call(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${TOKEN}`, ...(init.headers || {}) },
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    fail(`${path} returned non-JSON (HTTP ${res.status})`, text.slice(0, 500))
  }
  if (json.code !== 200) fail(`${path} rejected: code ${json.code}`, json)
  return json.data
}

async function main() {
  if (!TOKEN) fail('MSPBOTS_TOKEN is not set — nothing to authenticate with.')

  const expectSha =
    process.env.EXPECT_SHA || execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()

  log(`→ publishing ${APP} (project ${PROJECT_ID})`)
  log(`  expecting ${expectSha} to end up live`)

  const started = Date.now()
  const { jobId, total } = await call(`/projects/${PROJECT_ID}/publish`, {
    method: 'POST',
    headers: { 'content-length': '0' },
  })
  log(`  job ${jobId} — ${total} tenant databases to migrate`)

  await sleep(FIRST_POLL_DELAY_MS)

  let lastLine = ''
  while (Date.now() - started < TIMEOUT_MS) {
    const { job, failed = [], skipped = [] } = await call(`/migrations/${jobId}`)

    const line = `${job.status} ${job.done}/${job.total}`
    if (line !== lastLine) {
      log(`  [${((Date.now() - started) / 1000).toFixed(0)}s] ${line}`)
      lastLine = line
    }

    // finishedAt is the terminal signal; status is the verdict. This is deliberate —
    // the failure status string has never been observed, so we must not match on it.
    if (job.finishedAt) {
      if (job.status !== 'success') {
        fail(`deploy finished in non-success state "${job.status}"`, { job, failed, skipped })
      }
      log(`✓ job succeeded in ${((Date.now() - started) / 1000).toFixed(1)}s — version ${job.version}`)
      return verify(expectSha, job.version)
    }

    await sleep(POLL_INTERVAL_MS)
  }

  fail(`timed out after ${TIMEOUT_MS / 1000}s waiting for job ${jobId}`)
}

/**
 * The job claiming success is not proof. This public, unauthenticated endpoint reports what the
 * container is genuinely running — it flipped ~1.3s after finishedAt on the observed run.
 */
async function verify(expectSha, expectVersion) {
  const url = `https://agent.mspbots.ai/apps/${APP}/api/_version`
  for (let i = 0; i < 10; i++) {
    await sleep(2_000)
    let live
    try {
      live = await (await fetch(url)).json()
    } catch {
      continue // container still restarting
    }
    if (live.gitSha === expectSha) {
      log(`✓ live: ${live.version} @ ${live.gitSha.slice(0, 7)} (started ${live.startedAt})`)
      return
    }
    if (i === 9) {
      fail(
        `job reported success (version ${expectVersion}) but ${APP} is still serving ` +
          `${live.version} @ ${String(live.gitSha).slice(0, 7)}, expected ${expectSha.slice(0, 7)}`,
        live,
      )
    }
  }
}

main().catch((e) => fail(e.stack || String(e)))
