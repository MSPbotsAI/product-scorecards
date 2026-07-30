import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildScorecard, readMode } from "./lib/scorecard.ts";
import { GROUP_LABELS } from "./lib/rows.ts";
import { SETTING_DEFS, invalidateSettings, maskSecret, readSettings, writeSettings } from "./lib/settings.ts";

const serverDir = dirname(fileURLToPath(import.meta.url));

const basePath = (process.env.BASE_URL ?? "/").replace(/\/+$/, "");

const app = basePath ? new Hono().basePath(basePath) : new Hono();

app.get("/api/health", (c) =>
  c.json({
    app: process.env.APP_NAME ?? "product-scorecards",
    version: process.env.APP_VERSION ?? "dev",
    time: new Date().toISOString(),
  }),
);

app.get("/api/mode", async (c) => c.json({ mode: await readMode() }));

/**
 * Settings. Reads never return the API key itself — only a masked hint — so the page can confirm a
 * key is configured without the secret crossing back to a browser.
 */
app.get("/api/settings", async (c) => {
  const { values, origin, storageError } = await readSettings();
  return c.json({
    storageError,
    items: SETTING_DEFS.map((def) => ({
      key: def.key,
      secret: def.secret ?? false,
      env: def.env,
      default: def.default,
      origin: origin[def.key],
      value: def.secret ? "" : values[def.key],
      hint: def.secret ? maskSecret(values[def.key]) : "",
      configured: Boolean(values[def.key]),
    })),
  });
});

/**
 * Writing settings changes how the app authenticates, so it is gated on a platform session. The
 * app runtime attaches the caller's token to $fetch; an anonymous caller must not be able to
 * overwrite the API key just by reaching the URL.
 */
app.put("/api/settings", async (c) => {
  const token = c.req.header("authorization")?.replace(/^Bearer /i, "") ?? c.req.header("token") ?? "";
  if (!token) return c.json({ error: "sign in to change settings" }, 401);

  const body = (await c.req.json().catch(() => null)) as Record<string, string> | null;
  if (!body || typeof body !== "object") return c.json({ error: "expected a JSON object of settings" }, 400);

  try {
    await writeSettings(body, c.req.header("x-user-email") ?? null);
    invalidateSettings();
    return c.json({ ok: true, mode: await readMode() });
  } catch (error) {
    // A failed write must not look like a success: the page reports exactly why nothing was saved.
    return c.json({ error: (error as Error).message }, 502);
  }
});

// Shape probe, dev only. Reports the response envelope and the row's field NAMES — never values —
// so the resolvers can be checked against the real payload without exporting any data.
if (process.env.NODE_ENV !== "production") {
  app.get("/api/debug/facets/:id", async (c) => {
    const { probeFacets } = await import("./lib/scorecard.ts");
    try {
      return c.json(await probeFacets(c.req.param("id"), (c.req.query("cols") ?? "").split(",").filter(Boolean)));
    } catch (error) {
      return c.json({ error: (error as Error).message }, 502);
    }
  });

  app.get("/api/debug/shape/:id", async (c) => {
    const { probeShape } = await import("./lib/scorecard.ts");
    try {
      return c.json(await probeShape(c.req.param("id"), Number(c.req.query("size") ?? 1)));
    } catch (error) {
      return c.json({ error: (error as Error).message }, 502);
    }
  });
}

app.get("/api/timesheet", async (c) => {
  const { readTimesheet } = await import("./lib/timesheet.ts");
  try {
    return c.json(await readTimesheet(c.req.query("from") || undefined, c.req.query("to") || undefined));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 502);
  }
});

// In token mode the datasets are read as the calling user, so the user's token is forwarded rather
// than a service credential; tenantCode is not inferable server-side, so the client sends it. In
// public mode the app's own key (Settings page) is used and neither is needed.
app.get("/api/scorecard", async (c) => {
  const token = c.req.header("authorization")?.replace(/^Bearer /i, "") ?? c.req.header("token") ?? "";
  const tenantCode = c.req.header("tenantCode") ?? c.req.query("tenantCode") ?? "";
  const mode = await readMode();

  if (mode === "token") {
    if (!token) {
      return c.json(
        {
          error:
            "no API key configured and no platform token on the request. Set the API key on the " +
            "Settings page so the app reads with its own credential.",
          mode,
        },
        401,
      );
    }
    if (!tenantCode) return c.json({ error: "missing tenantCode", mode }, 400);
  }

  try {
    const result = await buildScorecard({ token, tenantCode });
    return c.json({ ...result, groups: GROUP_LABELS });
  } catch (error) {
    // Surface the real failure: a scorecard that silently renders zeros is worse than a visible error.
    return c.json({ error: (error as Error).message }, 502);
  }
});

const cacheControl = (pathname: string): string =>
  pathname.endsWith(".html") || pathname.endsWith("/")
    ? "no-cache"
    : pathname.includes("/assets/")
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600";

function bootstrap(hono: Hono) {
  const port = Number(process.env.PORT);

  if (process.env.NODE_ENV === "production") {
    let indexHtml: string | null = null;
    const sendIndex = (context: any) => {
      if (indexHtml === null) {
        try {
          indexHtml = readFileSync(join(serverDir, "index.html"), "utf8");
        } catch {
          indexHtml = "";
        }
      }
      if (!indexHtml) return context.json({ error: "Not Found" }, 404);
      context.header("Cache-Control", "no-cache");
      return context.html(indexHtml);
    };

    hono.get("/", sendIndex);
    hono.use(
      "/*",
      serveStatic({
        root: serverDir,
        rewriteRequestPath: (path) => path.slice(basePath.length) || "/",
        onFound: (_path, context) => context.header("Cache-Control", cacheControl(context.req.path)),
      }),
    );
    // SPA history fallback: match by request path, not the Accept header (wujie fetches the entry with Accept: */*); rule per connect-history-api-fallback.
    const stripBase = (path: string) =>
      basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
    hono.get("/*", (context) => {
      const path = stripBase(context.req.path);
      const isSpaRoute = !/^\/(api|ws|sse)(\/|$)/.test(path) && !/\/[^/]+\.[^/]+$/.test(path);
      return isSpaRoute ? sendIndex(context) : context.json({ error: "Not Found" }, 404);
    });
  }

  const server = serve({ fetch: hono.fetch, port }, (info) => {
    console.log(`Server listening on http://localhost:${info.port}`);
  });

  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 8000).unref();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

bootstrap(app);
