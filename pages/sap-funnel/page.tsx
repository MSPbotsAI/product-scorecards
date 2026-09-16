import { useCallback, useEffect, useState } from 'react'
import { Alert, AlertDescription, Badge, Card, CardContent, Skeleton, cn } from '@mspbots/ui'
import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react'
import { LangToggle, StatTile } from '../../lib/board'
import { useFunnelT, useLang } from '../../lib/i18n'

export const meta = {
  label: 'SOP Agent Funnel',
  icon: 'Filter',
  order: 4,
  menu: true,
  description: 'The Agent Platform engagement funnel, computed from the engagement store the ClickUp client board mirrors.',
}

/* ── types: the shape service/lib/sap-funnel.ts returns ── */

interface LadderRung {
  key: string
  label: string
  meaning: string
  count: number
  inFlow: boolean
}
interface ClientRef {
  domain: string
  company: string
  stage: string
  ageDays: number | null
  clickupTask: string | null
}
interface Funnel {
  generatedAt: string
  store: { mode: 'local' | 'git'; syncedAt: string | null; syncError: string | null }
  ladder: LadderRung[]
  totalClients: number
  committed: { count: number; clients: ClientRef[] }
  meetings: {
    held: number
    relevant: number
    distinctClients: number
    thisWeek: number
    thisWeekRelevant: number
    byWeek: { week: string; held: number; relevant: number }[]
  }
  mail: { accounts: number; batches: { id: string; sentOn: string; sender: string; countSent: number }[] }
  handoff: {
    started: number
    atAcquisitionGate: number
    atCommentGate: number
    closest: { domain: string; company: string; stage: string; required: number; fields: number }[]
  }
  stalled: { thresholdDays: number; clients: ClientRef[] }
  gaps: { layer: string; why: string; needs: string }[]
  metrics: {
    qualifiedCandidates: number
    demoCallsThisWeek: number
    pipelineFreshnessPct: number | null
    activeClients: number
    freshClients: number
  }
}

function useFunnel() {
  const [data, setData] = useState<Funnel | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (refresh: boolean) => {
    setLoading(true)
    setError(null)
    try {
      const res = await $fetch(`/api/sap-funnel${refresh ? '?refresh=1' : ''}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error ?? `request failed (${res.status})`)
      setData(body as Funnel)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to load the funnel')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(false)
  }, [load])

  return { data, error, loading, reload: () => void load(true) }
}

const clickupUrl = (id: string) => `https://app.clickup.com/t/${id}`

function TaskLink({ id, children }: { id: string | null; children: React.ReactNode }) {
  if (!id) return <>{children}</>
  return (
    <a href={clickupUrl(id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
      {children}
      <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
    </a>
  )
}

/**
 * One rung of the ladder. The bar is scaled against the widest rung rather than the total, so the
 * short rungs at the bottom stay readable — the point of the row is the count and the step-down,
 * not the area.
 */
function Rung({ rung, max, previous }: { rung: LadderRung; max: number; previous: number | null }) {
  const width = max > 0 ? Math.max((rung.count / max) * 100, rung.count > 0 ? 2 : 0) : 0
  const step = previous != null && previous > 0 ? Math.round((rung.count / previous) * 1000) / 10 : null
  return (
    <div className="grid grid-cols-[10rem_1fr_auto] items-center gap-3 py-1.5">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{rung.label}</div>
        <div className="truncate text-[11px] text-muted-foreground">{rung.meaning}</div>
      </div>
      <div className="h-6 rounded bg-muted/50">
        <div className="h-6 rounded bg-primary/70" style={{ width: `${width}%` }} />
      </div>
      <div className="w-24 text-right">
        <span className="text-sm font-semibold tabular-nums">{rung.count}</span>
        {step != null && <span className="ml-2 text-[11px] tabular-nums text-muted-foreground">{step}%</span>}
      </div>
    </div>
  )
}

function WeekBars({ weeks, t }: { weeks: Funnel['meetings']['byWeek']; t: ReturnType<typeof useFunnelT> }) {
  const max = Math.max(1, ...weeks.map((w) => w.held))
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-end gap-2">
        {weeks.map((w) => (
          <div key={w.week} className="flex w-12 flex-col items-center gap-1">
            <div className="text-[11px] tabular-nums text-muted-foreground">{w.held}</div>
            <div className="flex h-24 w-6 flex-col justify-end overflow-hidden rounded bg-muted/50">
              <div className="w-full bg-muted-foreground/25" style={{ height: `${((w.held - w.relevant) / max) * 100}%` }} />
              <div className="w-full bg-primary/70" style={{ height: `${(w.relevant / max) * 100}%` }} />
            </div>
            <div className="text-[10px] text-muted-foreground">{w.week.replace(/^\d{4}-/, '')}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-primary/70" /> {t.legendRelevant}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-muted-foreground/25" /> {t.legendOther}
        </span>
      </div>
    </div>
  )
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-3 pt-5">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {sub && <p className="mt-0.5 max-w-3xl text-xs text-muted-foreground">{sub}</p>}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

export default function SapFunnelPage() {
  const { data, error, loading, reload } = useFunnel()
  const t = useFunnelT()
  const lang = useLang()

  const flow = data?.ladder.filter((r) => r.inFlow) ?? []
  const exits = data?.ladder.filter((r) => !r.inFlow && r.count > 0) ?? []
  const max = Math.max(1, ...flow.map((r) => r.count))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reload}
            className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            {t.refresh}
          </button>
          <LangToggle />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {data?.store.syncError && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{t.staleStore(data.store.syncError)}</AlertDescription>
        </Alert>
      )}

      {loading && !data && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatTile label={t.tileClients} value={data.totalClients} hint={t.tileClientsHint} />
            <StatTile label={t.tileQualified} value={data.metrics.qualifiedCandidates} hint={t.tileQualifiedHint} />
            <StatTile label={t.tileCalls} value={data.metrics.demoCallsThisWeek} hint={t.tileCallsHint(data.meetings.thisWeek)} />
            <StatTile
              label={t.tileFresh}
              value={data.metrics.pipelineFreshnessPct == null ? '—' : `${data.metrics.pipelineFreshnessPct}%`}
              hint={t.tileFreshHint(data.metrics.freshClients, data.metrics.activeClients)}
            />
            <StatTile
              label={t.tileStalled}
              value={data.stalled.clients.length}
              hint={t.tileStalledHint(data.stalled.thresholdDays)}
              tone={data.stalled.clients.length > 0 ? 'red' : undefined}
            />
          </div>

          <Section title={t.ladderTitle} sub={t.ladderSub}>
            <div>
              {flow.map((rung, i) => (
                <Rung key={rung.key} rung={rung} max={max} previous={i > 0 ? flow[i - 1].count : null} />
              ))}
            </div>
            {exits.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                {t.exits}
                {exits.map((e) => (
                  <Badge key={e.key} variant="outline" className="font-normal">
                    {e.label} {e.count}
                  </Badge>
                ))}
                {data.committed.count > 0 && (
                  <Badge variant="outline" className="font-normal">
                    {t.committedTag} {data.committed.count}
                  </Badge>
                )}
              </div>
            )}
          </Section>

          <Section title={t.meetingsTitle} sub={t.meetingsSub(data.meetings.held, data.meetings.relevant, data.meetings.distinctClients)}>
            <WeekBars weeks={data.meetings.byWeek} t={t} />
          </Section>

          <Section title={t.handoffTitle} sub={t.handoffSub(data.handoff.atAcquisitionGate, data.handoff.started)}>
            {data.handoff.closest.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t.handoffEmpty}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max text-sm">
                  <thead>
                    <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="py-1.5 pr-4 font-medium">{t.colClient}</th>
                      <th className="py-1.5 pr-4 font-medium">{t.colStage}</th>
                      <th className="py-1.5 pr-4 font-medium">{t.colRequired}</th>
                      <th className="py-1.5 font-medium">{t.colAll}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.handoff.closest.map((c) => (
                      <tr key={c.domain} className="border-b last:border-0">
                        <td className="py-1.5 pr-4">{c.company}</td>
                        <td className="py-1.5 pr-4 text-muted-foreground">{c.stage}</td>
                        <td className="py-1.5 pr-4">
                          <span className="tabular-nums">{c.required}/7</span>
                          <span className="ml-2 inline-block h-1.5 w-20 rounded-full bg-muted align-middle">
                            <span className="block h-1.5 rounded-full bg-primary/70" style={{ width: `${(c.required / 7) * 100}%` }} />
                          </span>
                        </td>
                        <td className="py-1.5 tabular-nums text-muted-foreground">{c.fields}/13</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title={t.stalledTitle(data.stalled.thresholdDays)} sub={t.stalledSub}>
            {data.stalled.clients.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t.stalledEmpty}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max text-sm">
                  <thead>
                    <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="py-1.5 pr-4 font-medium">{t.colClient}</th>
                      <th className="py-1.5 pr-4 font-medium">{t.colDomain}</th>
                      <th className="py-1.5 font-medium">{t.colIdle}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stalled.clients.slice(0, 25).map((c) => (
                      <tr key={c.domain} className="border-b last:border-0">
                        <td className="py-1.5 pr-4">
                          <TaskLink id={c.clickupTask}>{c.company}</TaskLink>
                        </td>
                        <td className="py-1.5 pr-4 text-muted-foreground">{c.domain}</td>
                        <td className="py-1.5 tabular-nums">{c.ageDays == null ? t.never : t.days(c.ageDays)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.stalled.clients.length > 25 && (
                  <p className="mt-2 text-[11px] text-muted-foreground">{t.andMore(data.stalled.clients.length - 25)}</p>
                )}
              </div>
            )}
          </Section>

          {data.mail.batches.length > 0 && (
            <Section title={t.mailTitle} sub={t.mailSub(data.mail.accounts)}>
              <div className="flex flex-wrap gap-2">
                {data.mail.batches.map((b) => (
                  <Badge key={b.id} variant="outline" className="font-normal">
                    {b.id} · {b.sentOn} · {t.sent(b.countSent)}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          <Section title={t.gapsTitle} sub={t.gapsSub}>
            <ul className="space-y-2">
              {data.gaps.map((g) => (
                <li key={g.layer} className="rounded-md border border-dashed px-3 py-2">
                  <div className="text-sm font-medium">{g.layer}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{g.why}</div>
                  <div className="mt-1 text-xs">
                    <span className="text-muted-foreground">{t.needs} </span>
                    {g.needs}
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <p className="text-[11px] text-muted-foreground">
            {t.footer(
              data.store.mode,
              data.store.syncedAt ? new Date(data.store.syncedAt).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US') : t.footerLocal,
            )}
          </p>
        </>
      )}
    </div>
  )
}
