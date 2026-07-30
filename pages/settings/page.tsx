import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  cn,
} from "@mspbots/ui";
import { AlertTriangle, CheckCircle2, RotateCcw, Save } from "lucide-react";
import { LangToggle } from "../../lib/board";
import { useLang, useT } from "../../lib/i18n";
import { invalidateScorecard } from "../../lib/scorecard-client";

export const meta = {
  label: "Settings",
  icon: "Settings",
  order: 5,
  menu: true,
  description: "API key and dataset ids — stored in the app database so they survive a version update.",
};

interface SettingItem {
  key: string;
  secret: boolean;
  env: string;
  default: string;
  origin: "database" | "environment" | "default";
  value: string;
  hint: string;
  configured: boolean;
}

/** Field labels live here rather than in the generic i18n table — they are page-specific. */
const FIELD: Record<string, { en: [string, string]; zh: [string, string] }> = {
  public_api_key: {
    en: ["MSPbots API key", "Generated at app.mspbots.ai → Public API. The app reads datasets with this key."],
    zh: ["MSPbots API Key", "在 app.mspbots.ai → Public API 生成。应用用它读取 dataset。"],
  },
  "dataset.ai_weekly": {
    en: ["AI weekly series", "Week × tenant credits per AI product — drives the AI active-tenant rows and their history."],
    zh: ["AI 周序列", "周×租户的各产品 credit——驱动 AI 活跃租户行及其历史。"],
  },
  "dataset.ai_credit": {
    en: ["AI credit snapshot", "One row per paying tenant — drives the silent-paid rows and billing status."],
    zh: ["AI credit 快照", "每付费租户一行——驱动沉默付费行与计费状态。"],
  },
  "dataset.weekly_metrics": {
    en: ["Subscription weekly metrics", "Tenant × week — drives BI / Bot / NextTicket / Attendance rows."],
    zh: ["订阅周指标", "租户×周——驱动 BI / Bot / NextTicket / Attendance 各行。"],
  },
};

const ORIGIN_LABEL: Record<string, { en: string; zh: string; tone: string }> = {
  database: { en: "saved", zh: "已保存", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  environment: { en: "from environment", zh: "来自环境变量", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  default: { en: "built-in default", zh: "内置默认值", tone: "text-muted-foreground" },
};

export default function SettingsPage() {
  const t = useT();
  const lang = useLang();
  const [items, setItems] = useState<SettingItem[] | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [storageError, setStorageError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await $fetch("/api/settings");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `request failed (${res.status})`);
      setItems(body.items as SettingItem[]);
      setStorageError(body.storageError ?? null);
      setDraft({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load settings");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (Object.keys(draft).length === 0) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await $fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `save failed (${res.status})`);
      setSaved(true);
      // The scorecard is cached client-side; changing a key or a dataset id invalidates it.
      invalidateScorecard();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const dirty = Object.keys(draft).length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{lang === "zh" ? "设置" : "Settings"}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {lang === "zh"
              ? "保存在应用自己的数据库里（schema 绑定在稳定的 app id 上），因此发布新版本不会覆盖这些值。"
              : "Stored in the app's own database, under a schema keyed to the stable app id — so publishing a new version does not overwrite these values."}
          </p>
        </div>
        <LangToggle />
      </div>

      {storageError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {lang === "zh"
              ? "数据库不可用，下面显示的是环境变量或默认值，且无法保存修改："
              : "The database is unavailable — the values below come from the environment or defaults, and saving will fail:"}{" "}
            <span className="font-mono text-xs">{storageError}</span>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {saved && !error && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            {lang === "zh" ? "已保存。记分卡数据会在下次加载时使用新配置。" : "Saved. The scorecard will use the new configuration on its next load."}
          </AlertDescription>
        </Alert>
      )}

      {!items && <Skeleton className="h-72 w-full" />}

      {items && (
        <>
          {["public_api_key"].map((key) => {
            const item = items.find((i) => i.key === key);
            if (!item) return null;
            const field = FIELD[key][lang];
            const origin = ORIGIN_LABEL[item.origin];
            return (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{field[0]}</CardTitle>
                    <Badge variant="outline" className={cn("h-5 px-1.5 text-[11px] font-normal", origin.tone)}>
                      {origin[lang]}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{field[1]}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Label htmlFor={key} className="sr-only">
                    {field[0]}
                  </Label>
                  <Input
                    id={key}
                    type="password"
                    autoComplete="off"
                    placeholder={
                      item.configured
                        ? `${lang === "zh" ? "当前" : "current"}: ${item.hint} — ${lang === "zh" ? "留空则不修改" : "leave blank to keep"}`
                        : lang === "zh"
                          ? "尚未配置"
                          : "not configured yet"
                    }
                    value={draft[key] ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                    className="font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "zh"
                      ? "写入后不会再回传到浏览器，页面只显示遮罩提示。"
                      : "Once saved it is never sent back to the browser — the page only ever shows a masked hint."}
                  </p>
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{lang === "zh" ? "Dataset ID" : "Dataset IDs"}</CardTitle>
              <CardDescription className="text-xs">
                {lang === "zh"
                  ? "每个 dataset 必须已加入上面这个 key 的白名单（app.mspbots.ai → Public API）。"
                  : "Each dataset must be whitelisted on that API key (app.mspbots.ai → Public API)."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items
                .filter((i) => i.key.startsWith("dataset."))
                .map((item) => {
                  const field = FIELD[item.key][lang];
                  const origin = ORIGIN_LABEL[item.origin];
                  const current = draft[item.key] ?? item.value;
                  const changed = draft[item.key] != null && draft[item.key] !== item.value;
                  return (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor={item.key} className="text-sm">
                          {field[0]}
                        </Label>
                        <Badge variant="outline" className={cn("h-5 px-1.5 text-[11px] font-normal", origin.tone)}>
                          {origin[lang]}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{field[1]}</p>
                      <div className="flex items-center gap-2">
                        <Input
                          id={item.key}
                          inputMode="numeric"
                          value={current}
                          onChange={(e) => setDraft((d) => ({ ...d, [item.key]: e.target.value }))}
                          className={cn("font-mono text-[13px]", changed && "border-amber-500/60")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={current === item.default}
                          onClick={() => setDraft((d) => ({ ...d, [item.key]: item.default }))}
                          title={`${lang === "zh" ? "恢复默认" : "Reset to default"}: ${item.default}`}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={!dirty || saving}>
              <Save className={cn("mr-1.5 h-4 w-4", saving && "animate-pulse")} />
              {lang === "zh" ? "保存" : "Save"}
            </Button>
            {dirty && (
              <Button variant="ghost" onClick={() => setDraft({})} disabled={saving}>
                {lang === "zh" ? "撤销" : "Discard"}
              </Button>
            )}
            <span className="text-[11px] text-muted-foreground">
              {dirty
                ? lang === "zh"
                  ? `${Object.keys(draft).length} 项待保存`
                  : `${Object.keys(draft).length} pending change(s)`
                : lang === "zh"
                  ? "没有未保存的修改"
                  : "no unsaved changes"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
