import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  ScrollArea,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@mspbots/ui";
import { AlertTriangle, ChevronLeft, ChevronRight, FolderKanban, RefreshCw, Tag, User, Users, X } from "lucide-react";
import { LangToggle, StatTile } from "../../lib/board";
import { useLang } from "../../lib/i18n";

export const meta = {
  label: "Timesheet",
  icon: "Clock",
  order: 4,
  menu: true,
  description: "Logged hours for the product org — the labor side of every ROI row.",
};

interface Entry {
  date: string;
  ticketId: string | null;
  subject: string | null;
  project: string;
  person: string;
  category: string;
  client: string | null;
  hours: number;
}

interface TimesheetData {
  entries: Entry[];
  roster: { person: string; department: string | null; manager: string | null }[];
  excluded: string[];
  root: string;
  span: { from: string | null; to: string | null };
  totalRowsScanned: number;
}

const T = {
  en: {
    title: "Timesheet",
    subtitle: (root: string, n: number) =>
      `Logged hours for the ${root} reporting tree — ${n} people, resolved from the manager chain rather than a department.`,
    week: "Week",
    day: "Day",
    today: "Today",
    totalHours: "Total hours",
    people: "People",
    projects: "Projects",
    entries: "Entries",
    byProject: "By project",
    byPerson: "By person",
    byCategory: "By category",
    date: "Date",
    ticket: "Ticket",
    subject: "Subject",
    project: "Project",
    person: "Person",
    category: "Category",
    hrs: "Hrs",
    empty: "No entries in this range.",
    dataFrom: (a: string, b: string) => `data available ${a} → ${b}`,
    roster: "Included people",
    excluded: "excluded",
    filtered: "filtered",
    clearAll: "Clear all",
    ofTotal: (n: number) => `of ${n}`,
    refresh: "Refresh",
  },
  zh: {
    title: "工时",
    subtitle: (root: string, n: number) =>
      `${root} 汇报树下的登记工时——${n} 人，按汇报链递归解析，而非按部门。`,
    week: "周",
    day: "日",
    today: "今天",
    totalHours: "总工时",
    people: "人数",
    projects: "项目数",
    entries: "条目数",
    byProject: "按项目",
    byPerson: "按人",
    byCategory: "按类别",
    date: "日期",
    ticket: "工单",
    subject: "主题",
    project: "项目",
    person: "成员",
    category: "类别",
    hrs: "小时",
    empty: "该区间内没有工时记录。",
    dataFrom: (a: string, b: string) => `可用数据 ${a} → ${b}`,
    roster: "纳入人员",
    excluded: "已排除",
    filtered: "已筛选",
    clearAll: "清除全部",
    ofTotal: (n: number) => `/ 共 ${n}`,
    refresh: "刷新",
  },
};

const iso = (d: Date) => d.toISOString().slice(0, 10);
/** Monday-based week start — the same boundary the scorecard uses. */
function weekStart(d: Date): Date {
  const copy = new Date(d);
  const dow = (copy.getUTCDay() + 6) % 7;
  copy.setUTCDate(copy.getUTCDate() - dow);
  return copy;
}
const addDays = (d: Date, n: number) => {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + n);
  return copy;
};

type Dim = "project" | "person" | "category";
type Filters = Record<Dim, string | null>;

const dimOf: Record<Dim, (e: Entry) => string> = {
  project: (e) => e.project,
  person: (e) => e.person,
  category: (e) => e.category,
};

/**
 * Apply the active drill selections, optionally EXCLUDING one dimension — that is what lets a
 * breakdown card keep showing all of its own values while still reflecting the other cards'
 * filters (standard faceted cross-filtering, same as the reference app).
 */
function filterRows(rows: Entry[], f: Filters, exclude: Dim | null): Entry[] {
  return rows.filter((e) =>
    (["project", "person", "category"] as Dim[]).every(
      (d) => d === exclude || !f[d] || dimOf[d](e) === f[d],
    ),
  );
}

function Breakdown({
  title,
  icon,
  rows,
  total,
  selected,
  onSelect,
}: {
  title: string;
  icon: ReactNode;
  rows: [string, number][];
  total: number;
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-1.5 text-sm">
          {icon}
          {title}
        </CardTitle>
        <Badge variant="outline" className="h-5 px-1.5 text-[11px] font-normal">
          {rows.length}
        </Badge>
      </CardHeader>
      <CardContent className="pb-3">
        <ScrollArea className="h-[232px] pr-3">
          <div className="space-y-2.5">
            {rows.map(([label, hours]) => {
              const pct = total > 0 ? (hours / total) * 100 : 0;
              const isOn = selected === label;
              const dimmed = selected != null && !isOn;
              return (
                <div
                  key={label}
                  onClick={() => onSelect(label)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isOn}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      onSelect(label);
                    }
                  }}
                  className={cn(
                    "-mx-1.5 cursor-pointer rounded-md px-1.5 py-1 transition-colors hover:bg-muted/60",
                    isOn && "bg-muted ring-1 ring-inset ring-border",
                    dimmed && "opacity-55",
                  )}
                  title={`${label} · ${hours.toFixed(1)}h`}
                >
                  <div className="flex items-baseline justify-between gap-2 text-[13px]">
                    <span className={cn("min-w-0 truncate", isOn && "font-medium")}>{label}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {hours.toFixed(1)}h · {Math.round(pct)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", isOn ? "bg-primary" : "bg-primary/70")}
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default function Timesheet() {
  const lang = useLang();
  const t = T[lang];
  const [mode, setMode] = useState<"week" | "day">("week");
  const [anchor, setAnchor] = useState(() => weekStart(new Date()));
  const [data, setData] = useState<TimesheetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ project: null, person: null, category: null });

  const toggle = (dim: Dim) => (key: string) =>
    setFilters((f) => ({ ...f, [dim]: f[dim] === key ? null : key }));
  const clearAll = () => setFilters({ project: null, person: null, category: null });

  const from = mode === "week" ? iso(anchor) : iso(anchor);
  const to = mode === "week" ? iso(addDays(anchor, 6)) : iso(anchor);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await $fetch(`/api/timesheet?from=${from}&to=${to}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `request failed (${res.status})`);
      setData(body as TimesheetData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load the timesheet");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const view = useMemo(() => {
    if (!data) return null;
    const group = (rows: Entry[], key: (e: Entry) => string): [string, number][] => {
      const m = new Map<string, number>();
      for (const e of rows) m.set(key(e), (m.get(key(e)) ?? 0) + e.hours);
      return [...m.entries()].sort((a, b) => b[1] - a[1]);
    };
    // Fully-scoped rows drive the KPI band and the entry table; each card excludes its own
    // dimension so it still lists every value it could be filtered to.
    const scoped = filterRows(data.entries, filters, null);
    return {
      scoped,
      total: scoped.reduce((s, e) => s + e.hours, 0),
      byProject: group(filterRows(data.entries, filters, "project"), dimOf.project),
      byPerson: group(filterRows(data.entries, filters, "person"), dimOf.person),
      byCategory: group(filterRows(data.entries, filters, "category"), dimOf.category),
      people: new Set(scoped.map((e) => e.person)).size,
      unfilteredCount: data.entries.length,
    };
  }, [data, filters]);

  const chips = (["project", "person", "category"] as Dim[])
    .map((d) => (filters[d] ? { dim: d, value: filters[d] as string } : null))
    .filter(Boolean) as { dim: Dim; value: string }[];

  const step = (dir: -1 | 1) => {
    setAnchor((a) => addDays(a, dir * (mode === "week" ? 7 : 1)));
    clearAll();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
          {data && <p className="max-w-3xl text-sm text-muted-foreground">{t.subtitle(data.root, data.roster.length)}</p>}
        </div>
        <div className="flex items-center gap-2">
          {data?.span.from && data.span.to && (
            <span className="text-[11px] text-muted-foreground">{t.dataFrom(data.span.from, data.span.to)}</span>
          )}
          <LangToggle />
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
            {t.refresh}
          </Button>
        </div>
      </div>

      {/* range controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border bg-muted p-0.5">
          {(["week", "day"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                // Switching to week view snaps the anchor to that week's Monday.
                if (m === "week") setAnchor((a) => weekStart(a));
              }}
              aria-pressed={mode === m}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "week" ? t.week : t.day}
            </button>
          ))}
        </div>
        <Button variant="outline" size="icon-sm" onClick={() => step(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAnchor(mode === "week" ? weekStart(new Date()) : new Date())}
        >
          {t.today}
        </Button>
        <Button variant="outline" size="icon-sm" onClick={() => step(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="ml-1 text-sm font-medium tabular-nums">
          {from}
          {mode === "week" && ` — ${to}`}
        </span>
        <Input
          type="date"
          value={from}
          onChange={(e) => e.target.value && setAnchor(new Date(`${e.target.value}T00:00:00Z`))}
          className="h-8 w-[150px]"
        />
        {data && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-auto h-7 cursor-default gap-1.5 px-2 font-normal">
                <Users className="h-3.5 w-3.5" />
                {data.roster.length} {t.roster}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <div className="space-y-0.5 text-xs">
                {data.roster.map((r) => (
                  <div key={r.person}>
                    {r.person} · {r.department ?? "—"} · mgr {r.manager ?? "—"}
                  </div>
                ))}
                {data.excluded.length > 0 && (
                  <div className="mt-1.5 border-t pt-1.5 text-muted-foreground">
                    {t.excluded}: {data.excluded.join(", ")}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !data && <Skeleton className="h-[520px] w-full" />}

      {view && data && (
        <>
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{t.filtered}</span>
              {chips.map((c) => (
                <Badge key={c.dim} variant="secondary" className="h-6 gap-1 pl-2 pr-1 font-normal">
                  <span className="text-muted-foreground">{t[c.dim === "project" ? "project" : c.dim === "person" ? "person" : "category"]}:</span>
                  {c.value}
                  <button
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, [c.dim]: null }))}
                    aria-label={`clear ${c.dim} filter`}
                    className="ml-0.5 rounded p-0.5 hover:bg-background/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearAll}>
                {t.clearAll}
              </Button>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label={t.totalHours} value={view.total.toFixed(1)} />
            <StatTile label={t.people} value={view.people} />
            <StatTile label={t.projects} value={view.byProject.length} />
            <StatTile
              label={t.entries}
              value={view.scoped.length}
              hint={chips.length > 0 ? t.ofTotal(view.unfilteredCount) : undefined}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Breakdown
              title={t.byProject}
              icon={<FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />}
              rows={view.byProject}
              total={view.byProject.reduce((s, [, h]) => s + h, 0)}
              selected={filters.project}
              onSelect={toggle("project")}
            />
            <Breakdown
              title={t.byPerson}
              icon={<User className="h-3.5 w-3.5 text-muted-foreground" />}
              rows={view.byPerson}
              total={view.byPerson.reduce((s, [, h]) => s + h, 0)}
              selected={filters.person}
              onSelect={toggle("person")}
            />
            <Breakdown
              title={t.byCategory}
              icon={<Tag className="h-3.5 w-3.5 text-muted-foreground" />}
              rows={view.byCategory}
              total={view.byCategory.reduce((s, [, h]) => s + h, 0)}
              selected={filters.category}
              onSelect={toggle("category")}
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {t.entries} ({view.scoped.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {view.scoped.length === 0 ? (
                <p className="px-6 pb-4 text-sm text-muted-foreground">{t.empty}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead className="border-b text-[11px] uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-5 py-2 text-left font-medium">{t.date}</th>
                        <th className="px-3 py-2 text-left font-medium">{t.ticket}</th>
                        <th className="px-3 py-2 text-left font-medium">{t.subject}</th>
                        <th className="px-3 py-2 text-left font-medium">{t.project}</th>
                        <th className="px-3 py-2 text-left font-medium">{t.person}</th>
                        <th className="px-3 py-2 text-left font-medium">{t.category}</th>
                        <th className="px-5 py-2 text-right font-medium">{t.hrs}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {view.scoped.map((e, i) => (
                        <tr key={`${e.date}-${e.person}-${i}`} className="border-b last:border-b-0 hover:bg-muted/40">
                          <td className="whitespace-nowrap px-5 py-1.5 tabular-nums text-muted-foreground">{e.date}</td>
                          <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[12px]">{e.ticketId ?? "—"}</td>
                          <td className="max-w-[420px] truncate px-3 py-1.5">{e.subject ?? "—"}</td>
                          <td
                            onClick={() => toggle("project")(e.project)}
                            className="cursor-pointer whitespace-nowrap px-3 py-1.5 text-muted-foreground hover:text-foreground hover:underline"
                          >
                            {e.project}
                          </td>
                          <td
                            onClick={() => toggle("person")(e.person)}
                            className="cursor-pointer whitespace-nowrap px-3 py-1.5 hover:underline"
                          >
                            {e.person}
                          </td>
                          <td
                            onClick={() => toggle("category")(e.category)}
                            className="cursor-pointer whitespace-nowrap px-3 py-1.5 text-muted-foreground hover:text-foreground hover:underline"
                          >
                            {e.category}
                          </td>
                          <td className="px-5 py-1.5 text-right font-medium tabular-nums">{e.hours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
