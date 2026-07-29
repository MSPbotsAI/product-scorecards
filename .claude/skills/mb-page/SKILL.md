---
name: mb-page
description: Add or structure a screen in an MSPBots app. Use when creating a page/route, a sidebar/navigation menu entry, nested or parent routes, a page title/header, or gating a page by role. Covers the pages/**/page.tsx contract (default-export a component + named-export `meta`), the directory→route mapping, the `meta` fields (label, description, icon, order, menu, route), the breadcrumb/title via `label`, and frontend access via useAccess()/Permission. Critically: the app only authors pages/ and service/server.ts — never an entry, router, or CSS.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Page (file-based routing + `meta`)

A screen is a `page.tsx` file in `pages/`. The build (`@mspbots/routes` + `@mspbots/react`)
turns it into a route and a sidebar entry, then renders it inside the app shell
(`@mspbots/layout`'s `Layout`).

## The one rule that governs everything

**You only write `pages/**/page.tsx` (plus optional `layout.tsx`) and `service/server.ts`.** The system **virtually provides** the app
entry (`index.html` / the app entry / `styles.css`) plus the runtime: ReactDOM bootstrap,
`BrowserRouter`, `LayoutProvider`/`Layout`, the route table from `pages/`, theme/styles, auth
redirect, and role guards. So:

- **Don't** create an entry (`main.tsx`), `ReactDOM.createRoot`, `<BrowserRouter>`, or a route table — they're virtual, and there is no importable `mount`. (Advanced: drop an `index.html` / `styles.css` in the project root to override the virtual one.) If you're hand-rolling the router or runtime, stop — it's wrong.
- A `page.tsx` **default-exports a React component** and **named-exports `meta`**. That's the contract.

## The page contract

```tsx
// pages/dashboard/page.tsx  →  /dashboard
export const meta = {
  label: 'Dashboard',            // sidebar text · breadcrumb · browser tab title
  description: 'Your overview',  // HTML meta description (optional)
  icon: 'Home',                  // a lucide-react icon NAME (string)
  order: 1,                      // sort order in the sidebar
  menu: true,                    // show in sidebar (boolean | string[] | (roles) => boolean)
  route: true,                   // allow navigation  (boolean | string[] | (roles) => boolean)
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* content — the layout already provides a max-w-7xl padded, scrollable container */}
    </div>
  )
}
```

## Directory → route mapping (`@mspbots/routes`)

Next-style directory routing: a route is always a `page.tsx`, and **the directory it lives in (relative to `pages/`) is the path**.

| File | Route |
|---|---|
| `pages/page.tsx` | `/` (component `Home`) |
| `pages/about/page.tsx` | `/about` |
| `pages/user/list/page.tsx` | `/user/list` |
| `pages/user/[id]/page.tsx` | `/user/:id` (dynamic) |
| `pages/blog/[...slug]/page.tsx` | `/blog/*` (catch-all) |

- The path is derived **only** from the directory — there is **no `meta.path` override**. Express a dynamic segment with an `[id]` directory, a catch-all with `[...slug]` / `[[...slug]]`, and URL-invisible grouping with a `(group)` directory.
- **Root fallback:** if no page resolves to `/` (no `pages/page.tsx`), the first top-level directory's page becomes `/`.

### Groups & parent routes (a directory's own `page.tsx`)

```
pages/
└── settings/
    ├── page.tsx          // the /settings group or parent-route meta
    ├── profile/page.tsx  // /settings/profile
    └── security/page.tsx // /settings/security
```

- `settings/page.tsx` exports **only `meta`** → it's a non-clickable menu **group**.
- `settings/page.tsx` exports `meta` **+ a default component** → it's a **parent route** (`/settings`); render `<Outlet/>` (from `react-router-dom`) to show the child page.

### Layouts (`layout.tsx`)

A `layout.tsx` wraps its directory's `page` and every route beneath it, and composes across levels: `pages/layout.tsx` is the root layout; `pages/dashboard/layout.tsx` wraps `/dashboard/**`. A layout default-exports a component that renders `<Outlet/>` for the nested route.

## `meta` fields

| Field | Type | Meaning |
|---|---|---|
| `label` | `string` | Sidebar/menu text — **also the breadcrumb and browser tab title**. |
| `description` | `string` | HTML `<meta name="description">`. Optional. |
| `icon` | `string` | A **lucide-react icon name** (e.g. `'Home'`, `'Settings'`, `'Users'`, `'BarChart3'`). |
| `order` | `number` | Sort order in the sidebar. |
| `menu` | `boolean \| string[] \| (roles) => boolean` | Show in the sidebar. `string[]` = visible if the user holds one of those roles. |
| `route` | `boolean \| string[] \| (roles) => boolean` | Allow navigation. Fails → redirect to `/403`. |
| `fullscreen` | `boolean` | While ON this page, hide the sidebar **and the header bar**, letting the page fill the content area (focus views, wide dashboards, full-canvas tools). The page still appears in the sidebar. Add `breadcrumb: true` to keep the header bar. |
| `breadcrumb` | `boolean` | On a `fullscreen` page, set `true` to show the header bar (breadcrumb), which is otherwise hidden. No effect on non-fullscreen pages (shown by default). |
| `header` | `boolean` | Set `false` to **always** hide the header bar (breadcrumb) on this page — highest priority, overrides `breadcrumb`. |
| `micro` | `boolean \| { url?, alive?, sync?, degrade?, props?, name? }` | Render this route as an **embedded wujie sub-app** instead of the page component (see below). `true` embeds with defaults (entry from the sibling `url`); the object form carries options and may set its own `url`. |
| `url` | `string` | Sub-app entry URL for a `micro` route (e.g. `'/apps/reports/'`, or an env expression). Ignored unless `micro` is set. |
| `badge` | `string \| number \| { text, variant }` | Sidebar badge — a short label or count. Object form adds a color `variant` (`default` \| `secondary` \| `destructive` \| `outline`); a bare string/number is a neutral badge. |
| `disabled` | `boolean` | Grey out the sidebar item and block navigation to it. |
| `placement` | `'top' \| 'bottom'` | Pin a **top-level** entry to the bottom of the sidebar (above the account footer) with `'bottom'` — the usual home for Settings / Help / Feedback. Default `'top'`. Bottom entries keep their `order` among themselves. |
| `suffix` | `lazy component` | A **custom component on the right side** of the sidebar item — richer than `badge` (e.g. a Preview pill + count). Because `meta` is parsed statically, write it as a self-contained lazy import: `suffix: lazy(() => import('./PreviewBadge'))` (relative to the page file — the path is rewritten for you). When set, it takes the right slot and `badge` steps aside. Hidden when the sidebar is icon-collapsed. |
| `empty` | `string` | Placeholder text for a **parent with no children yet** (e.g. items loaded at runtime). On a normal node it renders as a collapsible parent showing this hint instead of a leaf link; on a `group: true` node it shows under the group label (like an empty "Pinned Apps" section). |
| `loading` | `boolean` | Render a **loading skeleton** in place of this entry (or, on a group, its rows) — for menus whose children/items load at runtime. |
| `color` | `string` | Font color of the label (any CSS color); wins over the active/selected color. |
| `size` | `string \| number` | Font size of the label (any CSS length; a number = px). |

`roles` come from `useAccess()` (globally injected by the app runtime; parsed from the platform token).
A `meta.group: true` node (with children) becomes a static sidebar group header. `meta.badge` / `meta.disabled` (above) are sidebar hints — the badge value is statically parsed, so use a string/number/`{ text, variant }`, not JSX. For arbitrary right-side content use `meta.suffix` (a lazy component), which **is** rendered as a component.

```tsx
// pages/sop/page.tsx — a custom right-side slot from a file page
import { lazy } from 'react'

export const meta = {
  label: 'SOP Library',
  icon: 'BookOpen',
  suffix: lazy(() => import('./SopStatus')), // renders <SopStatus /> on the right (e.g. a Preview pill + count)
}
```

```tsx
// The suffix component is a normal @mspbots/ui component — pages/sop/SopStatus.tsx
import { Badge } from '@mspbots/ui'
export default function SopStatus() {
  return (
    <span className="flex items-center gap-1">
      <Badge className="h-5">Preview</Badge>
      <Badge variant="secondary" className="h-5">4</Badge>
    </span>
  )
}
```

At runtime, `registerMenu` accepts `suffix` directly (any component or node): `registerMenu({ name: 'sop', label: 'SOP Library', suffix: SopStatus })`.

## Embed another app (`meta.micro`)

Turn a route into a **host** that embeds another MSPBots app as a [wujie](https://wujie-micro.github.io/) micro-frontend — the mechanism the platform itself uses. Set `meta.micro` plus the entry `url`; the runtime mounts the embed and forwards the current theme (and optional layout) to the child. The page's **default export renders as the loading / fallback UI** — shown until the child mounts, or if `wujie` is unavailable.

```tsx
// pages/reports/page.tsx
import { Spinner } from '@mspbots/ui'

export const meta = {
  label: 'Reports',
  icon: 'BarChart3',
  micro: true,                 // embed as a wujie sub-app
  url: '/apps/reports/',       // child entry (a string, or an env expression)
  // options form: micro: { alive: true, sync: true }   ({ url?, alive?, sync?, degrade?, props?, name? })
}

export default () => <Spinner />   // loading / fallback UI
```

Each embed gets a **tree-unique** wujie name automatically (this app's id + the route), so two apps built from the same template can safely nest — even a host that is itself embedded. Add `fullscreen: true` for a no-chrome, full-canvas embed. The host app needs `wujie` resolvable at runtime (it ships transitively; add `wujie` to the app's `dependencies` if your install prunes it).

## Page title (via `label`)

The breadcrumb and the browser tab title both come from **`meta.label`** — there is no separate page `title`.
`meta.description` sets the HTML `<meta name="description">`. There is **no shell to wrap** — the layout already
provides a padded, scrollable `max-w-7xl` container; just return your content, and write your own in-page
title/toolbar if you want one:

```tsx
import { Button } from '@mspbots/ui'
import { Plus } from 'lucide-react'

export const meta = { label: 'Users', description: 'Manage team members', icon: 'Users', menu: true, route: true }

export default function Users() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <Button><Plus className="mr-1.5 h-4 w-4" />Add</Button>
      </div>
      {/* ... */}
    </div>
  )
}
```

Build the body with `@mspbots/ui` components (see the **mb-ui** skill) and the theme tokens.
A full example is in [`reference/Example.tsx`](reference/Example.tsx).

## Access on the frontend

- **Menu/route gating:** `meta.menu` / `meta.route` (above).
- **Read the user/roles:** `useAccess()` (global, injected) → `{ roles, tokenPayload, isReady }`.
- **Render-gate a fragment:** `<Permission roles={['admin']} fallback={null}>…</Permission>` (from `@mspbots/ui`).

```tsx
import { Permission } from '@mspbots/ui'

const { roles, isReady } = useAccess()
// ...
<Permission roles={['admin']}><Button variant="destructive">Delete all</Button></Permission>
```

> Frontend gating is **UX only**. Always enforce permissions on the backend too — see the
> `mb-auth` skill. Never trust the client for authorization.

## Data & state

Fetch from your backend with `$fetch` / `$ws` / `$sse` (see the **mb-fetch** skill) inside
`useEffect`/handlers. Keep page state local (`useState`); there's no global store requirement.

## Register a menu entry at runtime (`registerMenu`)

Most sidebar entries come from `pages/**/page.tsx` `meta`. When you need one that **isn't a file
page** — an external link, a plugin-contributed entry, or a dynamically-added item — call the global
`registerMenu` (one entry) or `registerMenus` (a batch) — both injected by the runtime; no import. They merge
with the file-route menus and honor `order` / `placement` / `menu` (roles) / `children` / `icon` / `badge` / `suffix`.

```tsx
// Returns an unregister function; re-registering the same `name` replaces it.
const off = registerMenu({
  name: 'docs',
  label: 'Docs',
  href: 'https://docs.example.com', // external link (opens in a new tab)
  icon: 'BookOpen',                 // lucide name or a component
  placement: 'bottom',              // pin to the sidebar bottom
})

// A batch — an in-app route + a custom action (registerMenu also accepts an array):
registerMenus([
  { name: 'reports', label: 'Reports', path: '/reports', icon: 'BarChart3', order: 3 },
  { name: 'help', label: 'Help', icon: 'LifeBuoy', onClick: () => openHelp(), placement: 'bottom' },
])
```

An entry needs `name` + `label`, plus one of `path` (in-app SPA nav — the route must exist), `href`
(external), or `onClick` (custom). For **one-time, app-wide** entries, register them at startup from the
`setup` hook in the root `app.ts` (see below) — that runs once before the first render. You can
also call `registerMenu` inside a component effect for entries scoped to that screen's lifetime.
`registerMenu` adds a **sidebar entry only** — it does not create a route; the `path` target must be a real page.

### Register at startup — `app.ts` `setup`

```ts
// app.ts (project root) — `setup` runs once at boot, after globals are installed, before first render.
export function setup() {
  registerMenu({ name: 'docs', label: 'Docs', href: 'https://docs.example.com', icon: 'BookOpen', placement: 'bottom' })
}
```

Do **not** call `registerMenu` at the module top level of `app.ts` — that runs before the runtime
globals are installed. Use `setup` (it may be async; the first paint waits for it).

## Checklist

- [ ] page lives at `pages/**/page.tsx`, default-exports a component, named-exports `meta`
- [ ] no entry/router/`index.html`/CSS authored
- [ ] `icon` is a valid lucide name; `label`/`order` set (`label` is the sidebar text, breadcrumb, and tab title)
- [ ] `meta.description` set if the page needs an HTML description; content built from `@mspbots/ui`
- [ ] role-restricted pages set `meta.route` (and the backend enforces it too)

## Common issues

- **Page doesn't appear in the sidebar** → missing `meta`, `menu:false`, or a role check excludes the user.
- **Blank route / 404** → no `page.tsx` under `pages/`, or no `/` route (add `pages/page.tsx`).
- **Nested pages don't render** → the parent `page.tsx` (or `layout.tsx`) must render `<Outlet/>`.
- **Redirected to `/403`** → `meta.route` denied for the current roles.
- **You're editing an entry/router file** → it doesn't exist on purpose; put logic in the page or `service/server.ts`.
