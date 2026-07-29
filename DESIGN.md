## 1. Overview & Principles

MSPbots apps are a **control room, not a showroom**: users come to read KPIs and make decisions, not to look at the interface. So everything yields to the data — a near-white canvas, hierarchy from restrained shadow rather than borders everywhere; **slate** neutral gray as the base, color appears only to convey state or brand, default brand color **blue**. Moderate radius (~7px), neither sharp nor showy; **Inter** for the interface, **JetBrains Mono** for numbers that need to align. High density — operators must take in a whole screen at once. Overall close to **Notion and Linear**: clean, restrained, designed for long hours of screen time.

This document serves as prompt context for vibe coding tools, read by AI coding tools (Cursor / Copilot / Claude) before they generate UI code; §2–§8 are the landing of the principles below.

**Principles** — for people: what we stand by; for AI: which way to lean when unsure.

1. **Scan over browse** — scan, don't browse: table > card, row > tile, numeral > label, numbers aligned with `tabular-nums`. → §3 / §7.A.5 / §7.B
2. **Semantic over aesthetic** — color conveys state / polarity, not emotion; go through role scales, auto-flip light/dark, don't hardcode single-mode colors; whitespace groups. → §2 / §6.2
3. **Function over decoration** (Data-ink ratio, Tufte — non-data "ink" is cut wherever possible) — shadow / gradient / emoji / colored icon / decorative line stay only if they carry information. → §6 / §3.3
4. **System over bespoke** — UI is composed from `@mspbots/ui` components + tokens, don't build parallel UI (the engineering mechanism belongs to CLI conventions, not here). → §7.A
5. **Designed over improvised** — loading / error / empty / disabled / overflow all have prescribed forms, not improvised on the spot. → §7.B

### 1.1 Brand name — "MSPbots.ai"

User-visible copy referring to the brand must write `MSPbots.ai` (capital M, capital SP, lowercase bots, `.ai` all lowercase): page title / `<title>` / copy / About / footer / email / KB.

- ✓ `MSPbots.ai` ✗ `mspbots.ai` / `MSPBots` / `MSP Bots` / `Mspbots`
- **Exception**: technical identifiers (repo / npm package / variable / URL slug, e.g. `@mspbots/ui`, `mb-platform-cli`) follow technical convention, unchanged.

**DO / DON'T**

```tsx
<title>Ticket QA — MSPbots.ai</title>     ✓
<footer>© 2026 MSPbots.ai</footer>        ✓
<h1>Welcome to MSP Bots</h1>              ❌
```

### 1.2 App naming — `mspbot.config.ts`

Every app must explicitly set `system.app.name` (short name, sidebar / nav) and `system.app.title` (full title, browser `<title>`), **no scaffold-template default placeholders** — the shipped defaults (`'MSPbots AI'` / `'MSPbots Agent'` / `'MSPBots React Template'`) are copied verbatim by `mspbots init` and must be replaced.

```ts
react({ system: { app: {
  name: 'AI Ticket QA',          // sidebar / nav
  title: 'MSPbots Ticket QA',    // browser <title>
} } })
```

**Undecided**: a unified title format (`MSPbots.ai · {App}`?) is still to be decided by design + product; until then a brand-prefixed title (`MSPbots …`) on a properly renamed app is not a violation.

---

## 2. Colors

**Token cascade (3 layers)** — three-layer token cascade (table below):

| Layer | Role | Looks like | When to use |
|---|---|---|---|
| **Semantic tokens** | component token → Role scales | `bg-primary` / `text-destructive` | **default — first choice for all cases** |
| **Role scales** | 6 semantic roles → Hue scales | `bg-success-500` / `text-warning-700` | status colors (success / warning / info / danger) |
| **Hue scales** | 14 brand hue × 13 steps | `bg-blue-500` / `text-purple-700` | strictly limited: chart fixed-hue / code-monospace |

**One-line principle**: prefer Semantic tokens, Role scales supplement, Hue scales restricted.

**Theme switching**: `theme.preset: 'blue' | 'celery' | 'orange' | 'cyan' | 'red' | 'seafoam' | ...` (**build-time config** — rebuild after editing `mspbot.config.ts`, **not a runtime switch**), all three layers cascade automatically, no className changes. Switching preset only redirects `--color-brand-*`: `brand` tone (+ `--primary`/`--ring` and other brand-derived tokens) recolors accordingly; `success`/`warning`/`danger`/`info` (pinned to celery/orange/red/cyan) and `--chart-*` (independent palette) **stay put**.

**Dark mode**: Semantic tokens already carry light/dark dual values, **no need to write the `dark:` prefix**. `<div className="text-destructive">` automatically uses the destructive-dark value in dark mode.

### 2.1 Semantic tokens (default)

All UI colors must come from Semantic tokens + Tailwind opacity modifiers. Directly using Tailwind raw hue like `bg-red-600` / `text-gray-500` **bypasses the token cascade**, doesn't cascade on brand swap, doesn't auto-adapt to dark mode, and violates the Semantic tokens definition.

**Raw usage → token mapping**:

| Raw usage | Replace with |
|---|---|
| `text-red-*` / `bg-red-*` / `border-red-*` | `text-destructive` / `bg-destructive` / `border-destructive` |
| `text-gray-*` / `text-slate-*` / `text-zinc-*` (light / metadata) | `text-muted-foreground` |
| `bg-gray-*` / `bg-slate-*` (secondary surface) | `bg-muted` |
| `border-gray-*` (default border) | `border-border` |
| `bg-white` / `bg-zinc-50` (card / popover) | `bg-card` or `bg-popover` |
| light fill `bg-red-50/50` | `bg-destructive/10` (token + opacity) |
| Hover `hover:bg-red-700` | `hover:bg-destructive/90` (opacity) |
| direct hex / rgb / hsl / oklch / color-mix | any Semantic token |

**Forbidden locations** (hex / functional colors):
- `className="bg-[#...]"` (arbitrary value)
- `style={{ color: '#...' }}` (inline, violates §4.3)
- inline SVG `fill` / `stroke` of a non-brand logo

**Exemptions**:
1. Brand logo SVG assets (`/public/logo*.svg`) may use brand-blue hex
2. Chart fixed-hue (§2.3)
3. Code/monospace context (`<pre>` / `<code>`) keeps zinc-* / slate-*, add `{/* fixed-hue: code-block */}`

**DO / DON'T**

```tsx
<Button className="bg-destructive text-destructive-foreground">Delete</Button>   ✓ semantic token
<Card className="bg-card text-card-foreground border-border">...</Card>          ✓
<p className="text-muted-foreground">Last sync 5 min ago</p>                      ✓
<Button className="bg-red-600 hover:bg-red-700 text-white">                       ❌ raw hue
<div className="bg-[#1B7A6E]">                                                    ❌ arbitrary hex
<p className="text-gray-600">                                                     ❌ → text-muted-foreground
```

---

### 2.2 Role scales — status color + business polarity + chart

Semantic tokens have no flat `--success` / `--warning` / `--info` token (only `--destructive`). Status colors + chart data series use Role scales to reach Hue scales, giving both brand cascade + business-semantic protection. **Similarity**: the same role maps to the same color consistently (success is always celery green), so users can decode state by color — status colors must go through role tokens, never swap colors ad hoc.

**Status color → Hue scales mapping**:
- `success` → celery scale: business improving (SLA met / completion count up / error rate down / churn rate down)
- `warning` → orange scale: approaching threshold / needs attention but not worsening
- `info` → cyan scale: neutral hint / informational
- `danger` → red scale (= `--destructive`): business worsening

> **Status colors use stepped scales, not a bare token**: the `success`/`warning`/`info` roles exist as **13-step scales** (`--color-success-50…900`, generated by `emitAliases`) → **`text-success-700` / `bg-warning-100` work, and auto-adapt to dark** (the underlying hue flips values under `html.dark`). **But there is no flat `--success`** (only `--destructive` is a flat Semantic token) → **bare `text-success` (no step) resolves to no color**, a step is required.

**Usage**: write with a step — `bg-success-500` / `text-warning-700` / `border-info-300` (auto-adapts to dark).

**Business polarity** (KPIs are colored by business good/bad, not by number direction):

| Metric | Number dir | Business dir | Color |
|---|---|---|---|
| Churn up | ↑ | bad | `text-destructive` |
| Backlog down | ↓ | good | `text-success-700` |
| Avg resolution time down | ↓ | good | `text-success-700` |
| SLA compliance up | ↑ | good | `text-success-700` |
| No change / flat | → | neutral (no good/bad) | `text-muted-foreground` |

**Three-state polarity**: good = `text-success-700`, bad = `text-destructive`, **flat = `text-muted-foreground`** (no good/bad, no state color). Flat **must carry a non-color cue** (`—`/`Minus` or `→`, §2.4-C), don't rely on "no color" alone — otherwise it gets confused with "not loaded / missing".

**DO / DON'T**

```tsx
<div className="text-destructive">↑ Churn: 4.2%</div>        ✓ churn up = bad
<div className="text-success-700">↓ Backlog: 23</div>            ✓ backlog down = good
<div className="text-muted-foreground inline-flex items-center gap-1"><Minus className="size-3" /> Headcount: 142</div>   ✓ flat = neutral gray + dash (non-color cue)
<div className="text-success-700">↑ Churn: 4.2%</div>            ❌ mindlessly green
<div className="text-muted-foreground">142</div>                  ❌ flat only gray, no —/→ cue (looks like a missing value)
```

**Status badges → `Badge`'s variant × tone (don't hand-roll colors)**

`Badge` is the primary carrier of status color, with two orthogonal axes (not a single flat variant enum):
- **variant** (style): `solid` (bright filled — emphasis/alert) · `soft` (light bg same-color text — status default/calm) · `surface` (light bg + border) · `outline` (border — de-emphasized); tone-agnostic `ghost` / `link` variants also exist for non-status interactive uses
- **tone** (semantic color): 6 role tones `neutral` / `brand` / `success` / `warning` / `danger` / `info` — **= role token, never write hue/hex**; plus 7 **decorative-hue tones** `purple` / `magenta` / `indigo` / `seafoam` / `green` / `chartreuse` / `yellow` for **categorical** labels with no status meaning (tags / category chips). These are first-class Badge tones (a `tone` **prop**, not a hand-written hue class), so they're exempt from §2.3's `fixed-hue` marker — the exemption is the prop; a raw `bg-{hue}-*` class stays forbidden

**The `Badge` component owns the exact light/dark steps for every variant × tone — don't reproduce them here or hand-roll them with raw hue classes.** Your job is **tone = the situation's meaning**:
- `danger` — failure / over-threshold / destructive action (Churn ↑, SLA breached)
- `warning` — caution / approaching a limit (SLA at-risk) — **the orange badge belongs here, not on a healthy metric**
- `success` — healthy / resolved / positive · `info` — neutral informational · `brand` — primary emphasis (not a status) · `neutral` — default, no valence
- decorative hues (`purple` / `magenta` / …) — **categorical only** (team / type / tag), never to signal status

Picking the wrong tone for the meaning (a `warning` badge on a positive result, `success` green on a breach) is the violation — a **semantic judgment, not a hue-value grep**. (`solid` trades some text contrast for a brighter look — see §2.4-A.)

> **`default`/`secondary`/`destructive` are deprecated aliases** that keep their legacy recipes unchanged — zero breakage for old code; new code always uses variant + tone. Nearest modern equivalents: `default` ≈ `solid`+`brand`, `destructive` ≈ `solid`+`danger` (dark-mode steps differ slightly), `secondary` ≈ **`soft`+`neutral`** (a light tint — **not** `solid`+`neutral`, which is a filled gray). Migrating an alias changes rendering; don't rewrite mechanically.

**DO / DON'T**

```tsx
<Badge variant="soft" tone="success">Resolved</Badge>             ✓ normal status = soft
<Badge variant="solid" tone="warning">Breached</Badge>           ✓ needs alert/emphasis = solid (bright)
<Badge tone="success">Overdue</Badge>                            ❌ tone ≠ meaning (success on a bad state) — semantic misuse
<Badge variant="solid" className="bg-warning-700">…</Badge>      ❌ darkening the status color to force white-text contrast → alert color lost
<Badge className="bg-emerald-500/10 text-emerald-700">…</Badge>  ❌ raw hue + hand-rolled soft (§2.1 + dark, double violation)
```

**Banner status → `Alert`; choose the variant by what the message means**: `default` (neutral notice) · `info` (informational) · `success` (completed / positive) · `warning` (caution / approaching a limit) · `destructive` (error to handle). The component owns the colors and can carry inline actions (`AlertAction` / `AlertActions`) — **compose it, never hand-roll a tinted `div`**. The mistake to catch is the **wrong variant for the situation** (a `destructive` banner for a plain info message, `success` on a warning), not the color values.

**Chart colors — bottom line: always tokens, never raw values**

**Hard bottom line**: **all** chart colors — data series (fill/stroke) + chrome (grid/axis/tick/dot/cursor) — must come from tokens. **No raw values** (`#hex` / `rgb()` / `hsl()` / hardcoded literal colors), otherwise no brand cascade, no auto-dark, cross-page inconsistency. **Counter-example** (seen in a real app audit): a dashboard chart hardcoded series color + grid/axis/tick all as hex, and even hand-wrote `isDark ? '#1e293b' : '#f1f5f9'` in JS — a double violation of §2.1 (no raw hue) + dark auto-flip.

Under the "use tokens" premise, **which token set to pick depends on whether there is business-color semantics**:

- **No explicit business-color need → default `--chart-1..5`**: an independent categorical palette (blue/orange/purple/seafoam/yellow — hue-spaced for categorical separation, colorblind-safe, does not change with `theme.preset`), **does not route sentiment** (green in a pie chart doesn't auto-mean "good"). This is the worry-free default when the coder doesn't care about the specific colors.
- **Explicit business-color semantics** (e.g. a pass/warn/fail quality grading) → **pick the token per the coder's semantic need**: for status polarity use a role scale (`var(--color-success-600)` / `--color-warning-500` / `--color-destructive`), for a fixed brand-recognition color use a hue scale (`var(--color-blue-600)` + `{/* fixed-hue: chart category */}`, §2.3). **Only constraint: still a token, no hardcoding allowed.**
- **chrome** (grid/axis/tick/cursor) → semantic tokens: grid/axis = `var(--border)`, tick/label = `var(--color-muted-foreground)`, **not** slate hex.

The `--chart-1..5` → hue binding lives in `styles.ts` (library-owned); use the token, don't pick the hue.

**DO / DON'T** (framework's real usage = `ChartContainer` + `ChartConfig`, color through tokens)

```tsx
const cfg = { qa:   { label: "QA",   color: "var(--chart-1)" } }             ✓ no business need → default palette
const cfg = { fail: { label: "Fail", color: "var(--color-destructive)" } }   ✓ business semantics → role token
<CartesianGrid stroke="var(--border)" />                                     ✓ chrome through semantic token
<Bar fill="#398DFF" />  /  grid="#f1f5f9"                                     ❌ hardcoded hex (bottom-line violation)
const c = isDark ? "#1e293b" : "#f1f5f9"                                      ❌ hand-written dark in JS (tokens auto-flip, don't hand-roll)
```

---

### 2.3 Hue scales — restricted

Hue scale utilities (`bg-blue-500` / `fill-purple-300`) are brand-agnostic; using them directly bypasses Semantic tokens / Role scales and doesn't cascade on brand swap. **Forbidden** for ordinary UI.

**Only allowed**:
1. Fixed-hue identity for chart series — add `{/* fixed-hue: chart category */}`
2. Categorical legend hue distinguishing data categories — same as above
3. Code/monospace context — add `{/* fixed-hue: code-block */}`

> **chart category prefers tokens**: within 5 categories prefer §2.2's `--chart-1..5` (already categorical, hue-spaced, colorblind-safe, doesn't change with brand); raw hue only when **categories > 5** or a **fixed brand-recognition color** is needed, and must add the `fixed-hue` marker.

The skill must verify a `fixed-hue` comment within 2 lines (details in §8).

**DO / DON'T**

```tsx
<Bar dataKey="qa" className="fill-blue-500" />                      {/* fixed-hue: chart category */}
<pre className="bg-zinc-900 text-zinc-100">{snippet}</pre>          {/* fixed-hue: code-block */}

<Button className="bg-blue-500">Save</Button>                       ❌ ordinary UI bypassing tokens
<Badge className="bg-purple-300">New</Badge>                         ❌ use tone="purple" (§2.2 decorative tone), not a raw hue class
```

---

### 2.4 Color accessibility — WCAG 2.1 AA

Three color-related a11y bottom lines (keyboard / Tab / ARIA / screen reader belong to §7.B's a11y-scope note, currently deferred):

**A. Text contrast (1.4.3, ≥ 4.5:1)** — body vs background OKLCH L difference ≥ 0.45.
- body / label / button text → `text-foreground` or the matching Semantic `-foreground` pair
- secondary / metadata → `text-muted-foreground` (already the lowest-contrast token that still meets 4.5:1, **cannot lower opacity further, don't stack lighter**)
- forbid body tokens `<60% opacity`; forbid low-contrast same-family stacking (`text-muted-foreground` on `bg-muted`)
- **status-color badges are exempt from 1.4.3**: `Badge`'s tone color is handled by **B (1.4.11, ≥3:1) + a required text label** (see C), not held to 4.5:1 — a badge is a status signal, its meaning is carried by the label and color only reinforces; darkening a `-500` alert color to a `-700` brown to hit 4.5 would instead lose the alert effect. Approach: `soft`/`surface`/`outline` = same-hue dark text on a light bg (light/dark explicitly stepped), all ≥4.5 ✓. **`solid` exception (decided)**: the `solid` variant uses white text on a saturated fill, which for the lighter tones falls **below the 3:1 non-text bottom line**. The design decision is to **keep the bright look** (sacrificing strict contrast), mitigated with **`font-medium` weight + a one-step-darker border + a required text label**. A deliberate trade-off for status-color badges, not an oversight. (Exact steps / ratios live with the component, not here.)

**B. Non-text contrast (1.4.11, ≥ 3:1)** — component boundaries / icon-only controls / focus indicators / chart blocks need ≥ 3:1 against adjacent colors.
- ⚠️ in light mode `border-border` is **deliberately low-contrast** (see §6.2) — enough to separate content, but when the border / icon is the **only distinguishing cue** (an input that must be located, an icon-only button) don't rely on it alone.

**C. Don't convey meaning by color alone (1.4.1)** — state / polarity (§2.2 success/danger) **must** pair with a non-color cue (icon / text / arrow), so colorblind users can distinguish.

**DO / DON'T**

```tsx
<p className="text-foreground">Important</p>                          ✓ A
<p className="text-foreground/40">Faded</p>                           ❌ A: <0.6 opacity
<span className="text-success-700 inline-flex items-center"><ArrowDown className="size-3" /> Backlog 23</span>   ✓ C: color + arrow
<Badge className="bg-success-500" />                                  ❌ C: color only, no icon/label
```

---

## 3. Typography & Copy

### 3.1 Font families

`--font-sans` = Inter Variable (default UI) · `--font-mono` = JetBrains Mono Variable (code / data / table numbers). `html`/`body` default to sans; `<code>`/`<kbd>`/`<pre>` auto mono in `@layer base` → **no need to hand-write `font-sans`/`font-mono`** (only for explicit switching); table numbers `font-mono tabular-nums`. **Forbid** inline `fontFamily`, arbitrary `font-[...]`, redundant `font-sans`. **mono/code has no separate size tier** — use the body-* sizes (`text-body` 14 / `text-body-sm` 12), it is not a 4th type family (the Typography page "Code" group = body size + mono font).

### 3.2 Type scale

**3×3 semantic scale** (Atlassian-informed), defined in the `@theme` of `plugins/system/src/styles.ts` (Tailwind v4 `--text-*--{line-height,font-weight,letter-spacing}` modifiers). **metric-\* and heading-\* tokens bundle size + line-height + weight 600** (metric-\* and heading-xl/lg also bundle letter-spacing; heading-md has no tracking) → one class gives the full style, no hand-assembling `font-semibold tracking-tight`. **body-\* tokens bundle only size + line-height** — weight comes from inheritance (400 by default), so body text inside a `font-semibold` container needs an explicit `font-normal` to stay 400. The three classes split by **role** (the same px can be a heading or body depending on weight):

| Class | token | Use |
|---|---|---|
| **Metric** | `text-metric-xl` | hero KPI value |
| | `text-metric-lg` | secondary / in-card metric |
| | `text-metric-md` | inline / compact stat |
| **Heading** | `text-heading-xl` | page title |
| | `text-heading-lg` | section title |
| | `text-heading-md` | card / component title (`CardTitle` default) |
| **Body** | `text-body-lg` | long-form / prominent description / page caption |
| | `text-body` | **default UI body** |
| | `text-body-sm` | caption / metadata / fine print (`CardDescription` default) |

**All UI text goes through the semantic tokens above** (the 3×3 covers all metric / title / body roles) — bare Tailwind `text-xs…9xl` **is not used for UI text** (they are the "raw material" of the `--text-*` namespace, from which the semantic tokens derive). Mixing bare `text-*` with semantic tokens is an SSoT violation — and since `cn()` registers the semantic tokens in tailwind-merge's font-size group (config in `packages/ui/src/lib/utils.ts`), a bare `text-*` size in the same call overrides the token and silently drops its bundled weight. Only the rare non-role case (decorative large text etc.) uses a bare value, and needs a comment. `text-metric-xl` is the former `text-display` (renamed).

**Role > size**: `text-heading-md` and `text-body-lg` are the **same size**, distinguished as heading vs body by **weight** — so a **page caption can use `body-lg` (a prominent body size) without becoming a title** (answering "why can't the page caption be larger": with body-lg it can).

**Weight**: metric/heading have 600 built in; body defaults to 400 (interactive elements button/menu/tab/label use `font-medium`). A component **may** deliberately pair a `heading-*` size with `font-medium` to hold weight 500 at that size (e.g. `ItemTitle` on a default row — an intentional size/weight decouple, not a restack), and a contextual line-height tweak via a named `leading-*` utility or the `text-body/<leading>` modifier is allowed (retuning LH ≠ re-declaring the bundle). **Forbid**: `font-bold` (use the 600 built-in); re-declaring a token's own bundle with an **arbitrary** `text-[Npx]`/`leading-[N]`/`tracking-[N]`; using a **bare Tailwind size to override** a semantic token's size (loses the built-in weight — to change size, switch to another semantic token).

**Numeral** (§1 "numeral > label"): metric / price / table numbers add `tabular-nums` (numeric-style is not in the token); fixed decimal places + thousands separators per column, explicit currency / percent sign, abbreviate large numbers (`1.2M`, reveal full on hover); timestamps prefer relative + reveal absolute on hover; missing values muted `—`.

**Title ↔ caption (scales with title size, Proximity)**: caption size + its gap from the title both shrink with the title. With three body tiers unlocked, caption **sizes are all different**:

| header | title | caption | gap |
|---|---|---|---|
| **Page** | `text-heading-xl` | `text-body-lg` | `space-y-1` |
| **Section** | `text-heading-lg` | `text-body` | `space-y-1` |
| **Card** | `text-heading-md` | `text-body-sm` | `gap-y-0.5` |

caption sizes are distinct across all three tiers (page > section > card), no longer relying on gap. **Forbid**: a small title with a large caption (`heading-md` title + `body-lg` caption) or a fixed large gap (violates Proximity).

**DO / DON'T**

```tsx
<h1 className="text-heading-xl">Dashboard</h1>             ✓ page title (already has 600 + tracking)
<div className="text-metric-xl tabular-nums">96.4%</div>  ✓ KPI hero (metric already has 600 + tracking)
<CardTitle>Tickets</CardTitle>                             ✓ default text-heading-md
<div className="text-2xl font-bold">96.4%</div>           ❌ bare size + font-bold; numbers use text-metric-*
<CardTitle className="text-lg">…</CardTitle>              ❌ bare size override loses 600; use text-heading-lg
<h2 className="text-xs uppercase tracking-wider text-muted-foreground">  ❌ eyebrow as section title → use text-heading-lg
<h2 className="text-base font-semibold">section title</h2>   ❌ bare 16/600 = card tier (one step smaller); section uses text-heading-lg (20)
```

### 3.3 Iconography

Icons come **uniformly from `lucide-react`** (monochrome, size-adjustable, a11y-friendly); **no emoji as icons in the UI**. **SF Symbols-style matching = two axes** — **size**: `size-N` matched to the 3×3 tokens (`size-3`↔`text-body-sm` · `size-4`↔`text-body` (UI default) · `size-5`↔`text-body-lg` · `size-6`↔`text-heading-lg` (prominent action, 600 → strokeWidth 2.5); `size-8` empty-state / hero, standalone, not matched to inline text); **weight**: `strokeWidth` follows font weight (400→2, 600→2.5, don't pair a thin icon with bold text). **Optical alignment**: `inline-flex items-center` lands the icon's visual center on the text line, nudge off-center icons with `-mt-px` when needed. **Forbid**: bare `text-xs/sm/base/lg` (§3.2 not for UI text), hardcoded `width={17}`.

**When to use an icon**:

| Scenario | icon |
|---|---|
| Button (default) | not required, only when meaning needs reinforcing (`<Trash2/>` Delete) |
| icon-only button / empty state / list-status prefix / table sort | **required** |
| Menu item | optional (improves scan) |
| **title / pure decoration** | **forbidden** (violates §1 Function over decoration) |

**no-emoji scope**: covers only **JSX node text** (`<span>✅</span>`) and **JSX prop literals** (`<EmptyTitle>📭 …</EmptyTitle>`). **Exceptions** (not violations): `console.*` / `throw` strings (dev-only) · user-generated content (comments / chat / ticket) · test fixtures · ordinary punctuation / math / arrows (`→ ← ↑ ↓`) · the metadata separator dot `·` (§6.2).

**DO / DON'T**

```tsx
import { Save, Trash2 } from "lucide-react"
<Button><Save className="size-4 mr-2" />Save</Button>   ✓ size-4 matched to text-body, lucide
<h2><Rocket className="size-5" />…</h2>                  ❌ no icon on titles
<Button>✅ Confirm</Button>                               ❌ emoji as icon
<span>{ok ? '✓' : '✗'}</span>                            ❌ unicode as icon (use lucide Check / X)
```

### 3.4 Text wrapping & overflow

Long text (ticket title / company name / URL / description) **must pick a strategy**, don't leave the browser default:

| Do | How | When / Avoid |
|---|---|---|
| single-line ellipsis | `truncate` + ancestor flex `min-w-0` + **required** `title`/`Tooltip` | cell / list item / option value. **Forbid** on title / label / error / notification (use wrap instead) |
| N-line ellipsis | `line-clamp-N` + `min-w-0` | Card description / Alert title |
| full wrap | default wrap + `break-words` | body / description / containing URL·ID·email |
| force break | `break-all` | standalone URL / hash / token |

**⚠️ Root cause = flex/grid child `min-width:auto` doesn't shrink** (long text overflows / `truncate` fails): add **`min-w-0`** to flex children (every nesting level; column direction `min-h-0`) · grid columns use **`minmax(0,1fr)`** not `1fr`.
**CJK**: Chinese `word-break:normal` (default) is enough, **don't add `break-all`, don't apply tracking**. **Line length**: body ≤ ~66 characters (`max-w-prose`), CJK ≤ ~40 chars; tables / KPIs not limited.

**DO / DON'T**

```tsx
<div className="flex items-center gap-2 min-w-0">
  <Avatar /><span className="truncate" title={name}>{name}</span>   {/* ✓ truncate + reveal full */}
</div>
<p className="break-words">{longUrl}</p>    <div className="grid grid-cols-[minmax(0,1fr)_auto]">…   {/* ✓ */}
<div className="flex"><span className="truncate">{x}</span><Badge/></div>   {/* ❌ missing min-w-0 */}
<h1 className="truncate">{title}</h1>   {/* ❌ don't truncate a title → wrap */}
```

### 3.5 Microcopy

§3.1–3.4 govern the **form** of text; this section governs its **content** — so the user knows at a glance what this is, what to do, and what to do when something goes wrong (§1 clarity). **P3 advisory**: a review hint, **not a gate**; tone / brand voice / final wording is the designer's call, AI only flags suggestions, it doesn't decide for you.

| Do | Don't |
|---|---|
| action button = specific verb / outcome (`Create ticket` / `Save changes`) | a generic label as a specific action (`OK` / `Submit` / `Yes` / `Click here`) |
| error = cause + how to fix | `Error` / `Invalid input` / `Something went wrong` (no cause, no direction) |
| field has a visible label | placeholder as the **only** label |
| empty state points to the next step (paired with §7.A.4) | a bare `No data` |
| concise, sentence case, explain terms first | piling on jargon / all-caps shouting / verbose |

**DO / DON'T**

```tsx
<Button>Create ticket</Button>                                          {/* ✓ specific action */}
<Alert variant="destructive">Email already in use — <Button variant="link">sign in</Button></Alert>   {/* ✓ cause + fix */}
<Button>Submit</Button>                                                 {/* ❌ generic: submit what? */}
<Alert>Error</Alert>                                                    {/* ❌ no cause, no direction */}
<Input placeholder="Email" />                                           {/* ❌ placeholder as the only label */}
```

---

## 4. Spacing

### 4.1 Spacing scale

Tailwind v4 spacing utilities derive from `--spacing: 0.25rem` (4px). All `p-N` / `m-N` / `gap-N` / `space-N` / `w-N` / `h-N` with integer + 0.5 steps (`p-0.5`, `p-7`, `min-h-18`, `gap-7` etc.) **are all allowed**.

**Density conventions** (embodying §1 "Scan over browse"):

| Gap | Scenario |
|---|---|
| `gap-1` (4px) | label + value hugging, icon + text tight |
| `gap-1.5` (6px) | icon + text medium-tight (inside a button) |
| `gap-2` (8px) | **default sibling gap** — list items / form fields / button groups |
| `gap-3` (12px) | moderate grouping — within a form section |
| `gap-4` (16px) | **card grid (symmetric H/V, §5.2 Rule 1)** · nav sections |
| `gap-6` (24px) | between content blocks (`space-y-6`) · 2-zone layout split (settings / list-detail) |

**Padding conventions** (governs only **containers / custom elements** — the ones the author truly wants to set themselves):

| Scenario | Recommended |
|---|---|
| container padding (custom Section / panel) | `p-6` or `p-4` |
| compact custom control (chip / pill / tag) | `px-2 py-0.5` or `px-2 py-1` |
| between fields in a form | `space-y-3` or `space-y-4` |

> **Leave control sizing to the component**: the padding **and height** of `Button` / `Badge` / `Input` / `Tabs` etc. come from the component's `size` variant (`<Button size="sm">`) — **don't hand-write** `px-3 py-1.5` or a fixed `h-9` to replicate it (the opposite of §7 "use components, don't hand-roll"). When you build a **custom** control the library doesn't cover, **match the height of the library control next to it** (reuse the same `size`) so controls sit flush on a row; don't invent an off-system height. The px ladder itself is owned by `@mspbots/ui`.

**Density principle**: when unsure, **tighter** beats **looser** (the operator scans, doesn't browse). `gap-8+` is only for page-level section separation, **not** inside a Card / list / form. **Breathing hierarchy (Proximity — related information is visually closer)**: vertical spacing **decreases** with relationship strength —
`section↔section` **32** (`space-y-8`) > `container/element↔container` **24** (`space-y-6`) > `header↔content` **16** (`gap-4`, built into Card) > `title↔caption` **2–4** (scales with title size, **not fixed**, details in §3.2).
**Card grid symmetric H/V (§5.2 Rule 1)**: on a pure-card layout page the grid **H/V gaps are equal** — use `gap-4` (16px), **don't write** `gap-x-* gap-y-*`, the grid reads as one aligned plane. A pure-card page is **one uniform spacing**: the grid gap and the space **between card blocks** (`space-y`) both use 16 — `gap-4` + `space-y-4` (**not** `space-y-6`), don't introduce the 24/32 section hierarchy (that's ordinary-page Rule 2).

**DO / DON'T**

```tsx
<div className="flex gap-2">…</div>             ✓ default sibling gap (list / fields / button group)
<div className="space-y-4">…</div>              ✓ between sections
<Badge className="px-2 py-0.5">…</Badge>        ✓ compact control
<div className="p-[13px] gap-[7px]">…           ❌ arbitrary value → use the 4px scale
<div className="gap-10">…inside Card…</div>     ❌ gap-8+ not inside a Card / list / form
```

### 4.2 Arbitrary-value ban

Arbitrary values (`p-[7px]` / `mt-[13px]` / `w-[377px]`) break visual rhythm and cause cross-page alignment inconsistency.

**Strictly forbidden** (internal spacing): `[Npx]` / `[Nrem]` / `[Nem]` arbitrary values on `p-*` / `m-*` / `gap-*` / `space-x-*` / `space-y-*` / an element's own `w-*` / `h-*`.

**Only exemption** (negative-margin alignment): to align to a non-snapping element (e.g. a logo's bounding box) `m-[-Npx]` is allowed, add a `{/* arbitrary: aligning to logo */}` comment.

> Top-level **layout container width** (`max-w-[Npx]` etc.) is not governed by this section — see **§5 Layout** (prefer `<Page>` / standard tiers; when an arbitrary px is truly needed add `{/* layout: <reason> */}`).

**DO / DON'T**

```tsx
<div className="p-4 gap-3 space-y-6">          ✓
<div className="px-2.5 py-1 min-h-7 w-80">     ✓
<div className="p-[13px]">                     ❌
<div className="w-[377px]">                    ❌ exact Figma pixel
```

### 4.3 Inline-style ban

Static visual styles (color / spacing / radius / shadow / font-size / weight / line-height) always use tokens / utilities, **don't write `style={{...}}`**.

Inline style is only legitimate in **three cases Tailwind can't express** (no other exemption) — they are the **boundary** of the rule, not a patch:

| Only legit case | Example |
|---|---|
| viewport / percent / `calc()` relative size | `style={{ width: '95vw' }}` / `style={{ maxHeight: 'calc(90vh - 80px)' }}` |
| runtime JS-computed value | `style={{ height: \`${rowCount * 32}px\` }}` / `style={{ transform: \`translateY(${scrollY}px)\` }}` |
| third-party library forcing inline | library API requires it, add a comment explaining |

**DO / DON'T**

```tsx
<DialogContent style={{ width: '95vw', maxWidth: '95vw' }}>      ✓ viewport
<div style={{ height: `${rows * 32}px` }}>                        ✓ JS-computed
<div style={{ padding: 13 }}>                                     ❌ static value
<div style={{ backgroundColor: "#1B7A6E" }}>                     ❌ use bg-primary
```

## 5. Layout

Layout splits into two levels: the **app shell** (`DefaultLayout` + `Sidebar`) provided by `@mspbots/layout`; **page content** wrapped in `<Page>`. This chapter governs the container, width and column layout of page content.

### 5.1 Page container & width

**Standard container = the `<Page>` component** (`@mspbots/layout`). All page content is wrapped in `<Page>`, which uniformly provides centering + max width + padding + section spacing — **page width is decided by `<Page>`** (defer to the actual component). **Don't hand-roll** `mx-auto max-w-* px-*` containers, and don't set page padding by hand either (`Card` / `Dialog` / `Sheet` internal padding comes with each component).

```tsx
// <Page> provides centering + max-width + padding + section spacing (owned by the component)
<Page title="Tickets" description="...">
  {children}   {/* automatically gets centered container + padding + section spacing, width decided by <Page> */}
</Page>
```

- For **narrower** content (wizard / single-column reading / form): wrap `max-w-* mx-auto` again inside `<Page>`, **don't** change `<Page>` itself.
- To override the default width / padding: use `<Page contentClassName=...>`, don't bypass the component.

**Content width tiers**:

| Scenario | How |
|---|---|
| standard app page (default) | `<Page>` |
| single-column reading / settings panel | inner `max-w-3xl mx-auto` |
| focused task (wizard / form) | inner `max-w-2xl mx-auto` |
| Dialog / Sheet / Drawer | component's own `sm:max-w-*` (don't set by hand) |

**Arbitrary width**: page width prefers `<Page>` / the standard tiers above; use `max-w-[Npx]` only when the standard tiers don't cover it, and **must add `{/* layout: <reason> */}`**, the reason making clear "why the standard widths aren't enough".
> **Beyond standard width (no monitoring big-screen tier yet)**: page width is decided by `<Page>`, currently no wider variant; if wider is truly needed, add a width variant to `<Page>` (**dev candidate**), don't hand-roll a div to bypass it.

**Breakpoints**: follow Tailwind v4 defaults — `sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl` 1536. The CLI is pure v4 CSS-first (no config file), **don't introduce custom breakpoints**.

### 5.2 Grid

The CLI has **no** house `<Grid>` component; pages use Tailwind grid utilities ad-hoc. Recommended patterns:

| Scenario | Column structure |
|---|---|
| Dashboard KPI row | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` |
| Dashboard chart area | `grid grid-cols-1 lg:grid-cols-2 gap-4` (two-column) or `grid-cols-1` (single-column wide chart) |
| Settings main panel | `grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6` (left nav + content) |
| List / Detail split | `grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6` (list + detail) |
| Wizard | single column `max-w-2xl mx-auto`, **no** grid |
| Form section | `grid grid-cols-1 sm:grid-cols-2 gap-4` (two-column fields) or `space-y-4` (single column) |

**Rule 1 — pure-card page grid symmetric H/V**: on a pure-card layout page (Dashboard / KPI strip / card wall) the grid **horizontal and vertical gaps are equal** — always `gap-4` (16px), **don't write** asymmetric ones like `gap-x-4 gap-y-6` (unequal H/V looks misaligned; uniform spacing lets cards read as one **Alignment** plane). The 2-zone layout split (settings / list-detail) is overall looser at `gap-6` (also symmetric); the form-field grid uses `gap-4`. **"Vertical" includes between card blocks**: a pure-card page is one uniform 16px throughout — `gap-4` within the grid + `space-y-4` between card blocks (**not** `space-y-6`), don't mix in the 24/32 section hierarchy (see ordinary-page Rule 2). On desktop a KPI row is often a single row (no in-row vertical gap), so the visible vertical spacing is really the between-blocks tier — which must also be 16 for "vertical = horizontal" to truly hold.

**Rule 2 — ordinary pages partition by spacing, not by cutting sections with Cards**: on a non-card-wall ordinary page (settings / form / detail / document type), sections are separated by **spacing + section title** (`space-y-8` paragraph-level / `space-y-6` container-level, §3.2 / §4.1), **don't wrap each section in a Card**. Rationale = **Proximity takes precedence over Common Region**: section grouping relies on **spacing** (Proximity); a Card is a **bounded region** (Common Region), for a "content object" (a record / a KPI / a table), not a section separator; wrapping each block in a Card = borders everywhere + double padding + surface-hierarchy distortion, violating §1 "whitespace groups" + §6.2. For a stronger visual anchor use `<Separator>` / `border-t`, not a Card.

**Forbid hardcoded column counts** (bare `grid-cols-4` crushes on narrow screens): column count is always responsive. To let grid columns shrink / truncate use `minmax(0,1fr)` not `1fr` (§3.4).
> (**dev candidate**) extract the above patterns into a `<Grid>` component, as a peer of `<Page>`, so column layout also goes through a component rather than bare utilities.

### 5.3 Responsive & i18n resilience

- **`<sm` screens**: overlay components already carry their own mobile sizing — `Sheet` / `Drawer` side panels take `w-3/4` of the viewport (capped at `sm:max-w-sm` from `sm` up), `Drawer` top/bottom cap at `max-h-[80vh]`, `Dialog` stays a centered card with 16px gutters (`max-w-[calc(100%-2rem)]`); **don't add `w-screen` / `max-w-full` overrides**, and don't render desktop-wide overlays on mobile. `Sidebar` collapses to an overlay drawer, Display large text drops one tier.
- **i18n resilience**: don't hardcode widths to English length; containers allow wrap / truncate, button / label layouts don't break under 1.5–2× text expansion (German / CJK / long tenant names).
- **Decorative background**: hero decoration (`blur-3xl` / gradient) goes full-bleed outside `<Page>`, content stays centered and constrained, decoration doesn't break out past the content width.

**DO / DON'T**

```tsx
// ✓ standard page: use <Page>
<Page title="Tickets"><TicketTable /></Page>

// ✓ narrower content within the page
<Page><div className="max-w-2xl mx-auto"><SetupWizard /></div></Page>

// ✓ Dashboard 4 KPI row (card grid symmetric H/V gap, Rule 1)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// ❌ hand-rolled container bypassing <Page>
<main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

// ❌ arbitrary px page width (and no comment)
<main className="max-w-[1100px] mx-auto">

// ❌ custom breakpoint
<div className="md:max-w-[820px] xl-custom:max-w-[1380px]">

// ❌ Wizard using grid to widen
<div className="grid grid-cols-2 max-w-7xl"><Wizard /></div>

// ❌ card grid asymmetric H/V (violates Rule 1 → use gap-4)
<div className="grid lg:grid-cols-4 gap-x-4 gap-y-6">

// ❌ ordinary page wrapping each section in a Card as a separator (violates Rule 2 → use space-y-*)
<div className="space-y-6"><Card>Setting A</Card><Card>Setting B</Card></div>
```

---

## 6. Surface, depth & motion

How a box is physically rendered (surface / border / shadow / radius / z) + how it moves (motion). **`@mspbots/ui` components already encode the right combination — using the component is correct**; the rules below are for **self-built surfaces** (raw div / panel) or checking consistency.

**Elevation recipe** (components already carry it; when self-building a raw surface, replicate the corresponding row, **don't hand-copy onto a component**):

| Role | surface | shadow | radius | z | border |
|---|---|---|---|---|---|
| page base | `bg-background` | — | — | — | — |
| Card / container | `bg-card` | `shadow-xs` | `rounded-xl` | — | ✓ |
| Popover / Dropdown / Menu | `bg-popover` | `shadow-md` | `rounded-md` | `z-(--z-floating)` | ✓ |
| Tooltip | `bg-foreground` light · `dark:bg-neutral-300` dark (always dark bg + white text, **not** inverse — dark mode must not flip to a light chip) | — (no shadow) | `rounded-md` | `z-(--z-floating)` | — |
| Dialog / AlertDialog | `bg-background` | `shadow-lg` | `rounded-lg` | `z-(--z-floating)` | ✓ |
| Sheet | `bg-background` | `shadow-lg` | — (flush to edge) | `z-(--z-floating)` | ✓ (flush side) |
| Drawer | `bg-background` | — (no shadow — edge carried by border + scrim) | top/bottom: `rounded-b-lg` / `rounded-t-lg` on the inner edge; left/right flush | `z-(--z-floating)` | ✓ (flush side) |

### 6.1 Shadow scale — depth gradient

Source: Tailwind v4 default shadow scale.

| Shadow | Use |
|---|---|
| `shadow-none` | explicitly flat (embedded table / secondary block within a Card) |
| `shadow-xs` | **Card default + subtle lift** — content container lightly floating / Button (outline) / compact control |
| `shadow-sm` | (reserved — former Card default, now dropped one tier to `shadow-xs`; no default role for now) |
| `shadow-md` | overlay — Popover / Dropdown / Menu (Tooltip is always-dark, no shadow) |
| `shadow-lg` | modal — Dialog / Sheet (Drawer ships without a shadow) |
| `shadow-xl` | rarely used — hero / global alert |

**Shadow scale = Tailwind v4 defaults** (the library owns the exact values). **The higher the elevation the larger the blur**; except `shadow-xs` (shared tier for card surfaces and compact controls), component role ↔ tier correspond (using the wrong tier is a violation).

**Forbid**:
- `shadow-2xl` and larger shadows — Tailwind has them but this system doesn't use them, excessive lift breaks the operational-console feel
- `shadow-[0_10px_40px_rgba(...)]` arbitrary value
- **omitting shadow** on an element that already uses `z-(--z-floating)` — an overlay must have visible elevation

**DO / DON'T**

```tsx
<div className="bg-card border shadow-xs rounded-xl">…</div>   ✓ self-built card-level surface → shadow-xs
<PopoverContent>…</PopoverContent>                             ✓ component carries shadow-md, don't add more
<Card className="shadow-lg">…</Card>                           ❌ wrong tier: card level got a modal shadow
<div className="shadow-2xl">                                   ❌ beyond the system's shadow scale
<div className="fixed z-(--z-floating)">…</div>                ❌ self-built overlay missing shadow (overlays must have visible elevation)
```

---

### 6.2 Surface & border — the base of hierarchy

§6.1 Shadow gives an overlay **lift** (Figure-ground: shadow separates the overlay from the "ground" into a "figure"); this section gives the "ground" hierarchy — decided by surface token + border together.

**Surface tokens** — two mechanisms for light / dark: light surfaces are **flat** (`background` = `card` = `popover` = **pure white**), hierarchy comes **only from border**; dark surfaces are **layered** (each layer one step brighter) + border assists.

**Measured OKLCH-L values** (neutral=slate, making hierarchy **verifiable**, not by eye):

| token | light L | dark L | mapping |
|---|---:|---:|---|
| `--background` | 1.0 | 0.140 | light white / dark n-50 |
| `--card` | 1.0 | 0.174 | light white / dark n-100 |
| `--popover` | 1.0 | 0.210 | light white / dark n-200 |
| `--muted` | 0.972 | 0.210 | n-100 / n-200 |
| `--accent` | 0.972 | 0.244 | n-100 / n-300 — held one step above muted so dark hover stays visible |
| `--border` | 0.928 | 0.244 | n-200 / n-300 |

- **Light**: three surfaces same color (pure white) → hierarchy comes **only from border** (ΔL≈0.072 = white 1.0 − border 0.928). **A Card missing its border = lost hierarchy.**
- **Dark**: real steps `background 0.140 < card 0.174 < popover 0.210` (each step ΔL≈0.035) → an overlay using `--card` instead of `--popover` = collapse.

**Secondary surfaces** (outside the recipe matrix): secondary / disabled `bg-muted` · hover / selected `bg-accent` (distinct from the surface so hover always reads — light neutral-100, dark neutral-300; == muted only in light). **Forbid**: `bg-muted` as an overlay, jumping tiers across steps.

**Don't nest Cards** — one Card = one content surface. Group within a Card with `space-y` / `<Separator>` / `border-t` / a `bg-muted` secondary zone, **not another Card** (otherwise double border + padding + shadow, broken surface hierarchy, violating §1 density). List → `Table` (§7.A.5) or `border-b` rows, not a Card per row; multi-section detail → one Card + `border-t` sections. **Same for page sections**: on an ordinary page separate sections by spacing (`space-y-6/8`), not a Card per block (§5.2 Rule 2).

**Border is structure, not decoration**: default 1px `border-border`; directional `border-t/b/l/r` partitions.
- **Card / container must add `border`** (light hierarchy relies entirely on it); **Table row** `border-b`; **Form / Sidebar group** `border-t` (not an `mt-8` gap); **Tab selected** `border-b-2 border-primary`
- **Omit border**: a nested element already inside a bordered Card (avoid double border)
- **Forbid decorative dividers**: `<hr>` → `<Separator>` (`@mspbots/ui`); no emoji / unicode divider lines; metadata dots use `<span className="text-muted-foreground">·</span>`

**DO / DON'T**

```tsx
<Card>…</Card>                                     ✓ component carries bg-card + border + hierarchy
<div className="bg-card border rounded-xl">…</div> ✓ self-built container: add border per the Card row (light hierarchy relies entirely on it)
<div>A</div><Separator /><div>B</div>              ✓ separate with a component

<Card><Card>…</Card></Card>                        ❌ same-level nested Card, broken surface hierarchy
<div className="bg-muted">{/* overlay */}</div>    ❌ bg-muted as an overlay (jumps tiers)
<hr className="my-4" />                             ❌ use Separator
<div className="my-8">                             ❌ margin-only separation, missing a visual anchor
```

---

### 6.3 Radius

```
--radius-md      drives rounded-md (theme-configurable); other tiers (xs/sm/lg/xl/full) use Tailwind v4 defaults
--radius-inset   for nested controls (input-group children); apply via the generated rounded-inset utility
```

**Radius scale by role** (large to small = visual weight high to low):

| Utility | Use |
|---|---|
| `rounded-xl` | **Card container** (visual-emphasis level, built into Card.tsx) |
| `rounded-lg` | modal level — Dialog / AlertDialog |
| `rounded-md` | **UI default** — Button / Popover / Dropdown / Input |
| `rounded-sm` | compact detail — `Badge shape="rounded"` / `Kbd` / `Item` media (Input itself is `rounded-md`) |
| `rounded-xs` | tiny element — close icon / chip / DialogClose |
| `rounded-full` | circular — Avatar / Badge dot / status indicator |
| `rounded-inset` | nested child control (InputGroup child, keeping nested visual tracking) |

**Mixing constraint**: within the same container **outer radius ≥ inner** (Card `rounded-xl` holding Button `rounded-md` ✓; the reverse ❌); don't mix radii ≥ 2 tiers apart at the same level (`rounded-xl` Card next to `rounded-xs` Card = visual break).

**Forbid**: `rounded-[8px]` arbitrary value · `style={{ borderRadius: 6 }}` inline · square `rounded-none` for content containers (only table cell / divider etc.).

**DO / DON'T**

```tsx
<Card className="rounded-xl"><Button className="rounded-md">Save</Button></Card>  ✓ outer large inner small
<Avatar className="rounded-full" />                                              ✓ circular
<div className="rounded-md"><Card className="rounded-xl">                         ❌ outer smaller than inner
<div className="rounded-[8px]">                                                  ❌ arbitrary value
```

---

### 6.4 Z-index — 6 tokens, unified overlay

**6 tokens**:

| Token (low → high) | Use |
|---|---|
| `--z-base` | default base layer |
| `--z-sticky` | in-page sticky (PageHeading / in-page Header) |
| `--z-fixed` | app-shell chrome (SidebarFrame / Sidebar — positioned by the shell; SidebarFrame is `absolute`) — below overlays |
| `--z-floating` | **unified overlay** — modal scrim+content / popover / dropdown / select / menu / tooltip / dialog / sheet / drawer all on this layer, DOM order (Radix portal mount order) resolves within-layer stacking |
| `--z-toast` | toast tier — above overlays. **Not yet consumed in code**: the shipped `Toaster` relies on sonner's own default z-index (which in practice also sits above `--z-app-top`); apply this token only when building a custom toast-level surface |
| `--z-app-top` | app-shell top header (HeaderFrame) — engineering convention: **always** above overlay modals, cannot be demoted |

**Syntax** (Tailwind v4 arbitrary value):
```tsx
<div className="z-(--z-floating)">      ✓ read token
<div className="z-(--z-toast)">         ✓
<div className="z-(--z-sticky)">        ✓
```

**Local stacking exemption**: micro-stacking **inside** a component (focus ring / sibling overlap / sticky table column) may use Tailwind numeric utilities `z-1` / `z-2` / `z-10` etc. — these tokens are only for **cross-component** layers.

**Forbid**:
- arbitrary values `z-[100]` / `z-[16005]` / `z-[200]` / `z-[17001]` (violates the Semantic token philosophy)
- numeric utilities in cross-component scenarios (apply a token, not a number)
- negative z-N

**Fix approach**: seeing `z-[200]` / `z-[17001]` = a design error. Fix: portal re-render / adjust the stacking context / Radix Portal renders to body by default and self-manages z, don't bump the number.

**DO / DON'T**

```tsx
<DialogContent className="z-(--z-floating)">    ✓ unified overlay
<header className="fixed z-(--z-app-top)">      ✓ permanent top layer
<aside className="absolute z-(--z-fixed)">      ✓ sidebar below overlays (matches SidebarFrame's positioning)

<div className="z-[200]">                       ❌ arbitrary value
<Dialog className="z-50">                       ❌ numeric utility, cross-component should go through a token
```

### 6.5 Motion

**Components carry motion, don't re-specify** — the enter/exit animations of Dialog / Sheet / Drawer / Popover / Dropdown / Tooltip / Accordion / Select are already built in (`tailwindcss-animate`). Using the component = animation for free and correct; **don't hand-write `data-[state=open]:duration-… ease-…` to override** — this is exactly the common root of "motion done poorly / only comes out after repeated dialogue".

Motion tokens are only for **custom transitions components don't cover** (hover / focus color, self-built expand/collapse):

| Custom scenario | duration | ease |
|---|---|---|
| Hover / focus color change | `--motion-duration-fast` | `--motion-ease-emphasized` |
| self-built toggle / expand | `--motion-duration-base` | `--motion-ease-emphasized` |

The full tokens (**1 ease**: emphasized — standard / decelerate / accelerate were removed (zero consumers; for other curves use Tailwind `ease-*` directly); 3 durations: fast / base / slow) are in styles.ts.
**Forbid**:
arbitrary `duration-[…]` / `ease-[cubic-bezier(…)]` / inline transition — custom animation also goes through tokens.

**DO / DON'T**

```tsx
<Dialog>…</Dialog>                                                                ✓ enter/exit carried by the component, add nothing
<div className="transition-colors duration-(--motion-duration-fast) ease-(--motion-ease-emphasized)">  ✓ custom hover
<Sheet className="data-[state=open]:duration-(--motion-duration-slow)">            ❌ don't hand-tune the component's built-in animation
<div className="duration-200 ease-in-out">                                        ❌ arbitrary value + non-token
```

---

## 7. Components

UI always uses `@mspbots/ui` (60+ components) + `@mspbots/layout` components. **The API catalog (variants / props / sizes) lives in the `@mspbots/ui` README; the engineering rules ("import-first / no raw HTML / compose don't hand-roll / lucide / cn / ScrollArea") and the component index live in the template README** (engineering conventions, §1 principle 4 — not repeated in this document). This chapter governs only the **design layer**: §7.A which component pattern to compose for which scenario, §7.B what each interaction / data state looks like. **The library (+ Figma) owns each component's internal values — exact sizes, color steps, radii — and this document never restates them; its job is the AI's decisions: pick the component/variant whose meaning fits the scenario, and when building something new, match the system's existing values.**

### 7.A Composition patterns

#### 7.A.1 Dashboard / KPI = `Card` grid

KPI / metrics display must use a `Card` grid, one Card per KPI. **Column structure always responsive**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` (mobile 1 / tablet 2 / desktop 4; symmetric H/V gap, §5.2 Rule 1) — **forbid hardcoded column counts** (bare `grid-cols-4` crushes on narrow screens). hero number `text-metric-xl tabular-nums` (§3.2 metric tier, already has 600+tracking), trend `text-body font-medium` + `text-success-700`/`text-destructive`. **The metric name (label) uses `text-body` (14px), overriding `CardDescription`'s default `body-sm` (12px)** — the metric name needs to be quickly identifiable, more prominent than a "card description" (subordinate note, 12px); this is a KPI special case, not a general caption.

**DO / DON'T**

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card>
    <CardHeader>
      <CardDescription className="text-body">SLA Compliance</CardDescription>  {/* metric label = body 14px, see below */}
      <CardTitle className="text-metric-xl tabular-nums">96.4%</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-body font-medium text-success-700">↑ 2.1% vs last week</p>
    </CardContent>
  </Card>
</div>
```

`gap-4` (symmetric H/V 16px, §5.2 Rule 1) — a pure-card grid has equal H/V gaps, reading as one aligned metric plane; **forbid** using `gap-x-* gap-y-*` to pull H/V apart asymmetrically.

- `CardHeader` → metric name (`CardDescription className="text-body"`, 14px; no Title needed)
- `CardContent` → large number + trend text
- trend coloring uses `text-success-700` / `text-destructive` / `text-muted-foreground` (paired with §2.2 business polarity)
- **large numbers don't overflow**: something like `$1,234,567` overflows a narrow `lg:grid-cols-4` card → abbreviate (`1.2M` / `$1.2M`) + reveal full value on hover, don't let numbers overflow or shrink to unreadable

```tsx
<div className="flex gap-4">                  ❌ flex is not a KPI grid
  <div className="bg-white p-4">              ❌ raw div + bg-white
    <p>SLA</p><h2>96.4%</h2>                  ❌ no Card
  </div>
</div>
```

#### 7.A.2 Multi-step wizard

A multi-step flow must use one of the following 2:

**1. Linear Wizard** (no going back): `Tabs` + controlled value + `Progress` step progress + `Button` to switch steps
```tsx
<div className="space-y-6">
  <Progress value={(step / totalSteps) * 100} />
  <Tabs value={String(step)} onValueChange={v => setStep(Number(v))}>
    <TabsContent value="1">...</TabsContent>
    <TabsContent value="2">...</TabsContent>
  </Tabs>
  <div className="flex justify-between">
    <Button variant="outline" onClick={prev}>Back</Button>
    <Button onClick={next}>Next</Button>
  </div>
</div>
```

**2. Nested Dialog Wizard** (configuration / onboarding): use `Tabs` to switch steps inside a `Dialog`

**Forbid**: hand-rolled `<div role="tablist">` stepper / stacking multiple `Dialog`s / `Accordion` as a wizard (wrong semantics).

#### 7.A.3 Detail panel — `Sheet` (not Dialog)

| Scenario | Use |
|---|---|
| click to view full content | `Sheet` (slide out from right) |
| edit a config item | `Sheet` |
| "confirm delete?" | `AlertDialog` |
| "operation failed" | `Alert` or `Toast` (`sonner`) |
| forced selection, cannot close | `Dialog` — suppress Esc via `<DialogContent onEscapeKeyDown={e => e.preventDefault()} showCloseButton={false}>` |

**DO / DON'T**

```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild><Button>Open</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader><SheetTitle>Ticket #{id}</SheetTitle></SheetHeader>
    {/* detail */}
  </SheetContent>
</Sheet>                                                              ✓

<Dialog open={open}>                                                  ❌ should use Sheet
  <DialogContent className="max-w-4xl">                                ❌ enlarging a Dialog to fake a Sheet
```

**Feedback channel choice** (avoid misuse):
- **`Sonner` toast** — the **transient, non-blocking** result of a user-initiated action (saved / sent / sync started), auto-dismisses.
- **inline `Alert`** — a persistent surface state or a message the user must read/handle. 5 semantic variants (`default`/`info`/`success`/`warning`/`destructive`, §2.2) → **not just errors**; an info/success/warning banner is an `Alert`, not a hand-rolled tinted div. Takes inline actions via `AlertAction` / `AlertActions` (+ right-aligned `AlertTrailing`) — e.g. an "Undo" / "View" button in the banner.
- **`AlertDialog`** — a blocking confirmation.
- **Don't** toast field validation errors (belongs to inline `FieldError`, §7.A.6); don't use a `Dialog` to report transient success.

**Destructive / high-risk confirmation flow**: `AlertDialog` uses a **specific verb** ("Delete 3 tickets" not "OK"); the confirm action button is `variant="destructive"` (red); default focus **Cancel** (don't default focus the destroy key); give a result toast after the action; add a type-to-confirm for irreversible bulk operations.

#### 7.A.4 Empty state — `Empty` component

The "no data" display for list / search / table / dashboard must use the `Empty` suite + `lucide-react` icons (paired with §3.3 no emoji).

**Structure**: `EmptyMedia` (a `lucide-react` icon, §3.3) + `EmptyTitle` + `EmptyDescription` + **optional** `EmptyContent` (CTA — **only when there is an actionable action**, e.g. Create / Reset / Search). The component owns the icon box + text sizing; compose the parts, don't set them.

**DO / DON'T**

```tsx
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@mspbots/ui"
import { Inbox } from "lucide-react"

{tickets.length === 0 && (
  <Empty>
    <EmptyMedia><Inbox className="text-muted-foreground" /></EmptyMedia>
    <EmptyTitle>No tickets yet</EmptyTitle>
    <EmptyDescription>Create your first ticket to get started.</EmptyDescription>
    <EmptyContent><Button>Create ticket</Button></EmptyContent>
  </Empty>
)}                                                                    ✓

{items.length === 0 && (
  <div className="text-center p-8 text-muted-foreground">              ❌ raw div
    No data
  </div>
)}
```

#### 7.A.5 Table — data grid (the home ground of §1's first principle "table > card")

Data lists / grids use the `Table` family (`Table` / `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell`), don't hand-roll `<table>`.

- **Placement — page vs widget**: a table that **is the page's main content** → page title + toolbar row + `Table` directly, **no Card** (§5.2 Rule 2 — a Card is for a content-object/widget); a table as a **dashboard widget** → inside a `Card`. A page-main table **fills the viewport height** — the page itself doesn't scroll, the table body does, and the pagination reads as a footer.
- **Header row** — title (+ caption) left, tools (search / buttons / tabs / filters) right on the **same row**, vertically centered; give them their own row **only** when the title is long or the tools are many (won't fit); keep toolbar controls at **32px** (`size="md"`/`icon-md"`). In a Card override `CardHeader` to `flex items-center justify-between` (**not `CardAction`**, its `self-start` top-aligns).
- **Row actions** — prefer `ghost`/`outline` **icon-only** Buttons (+ `Tooltip` + `aria-label`); when > 5 actions, keep the 1–2 common ones inline and collapse the rest into a `DropdownMenu` (⋯) "more" menu.
- **Header sorting**: sortable columns add a sort indicator (`<ChevronUp/Down>`, §3.3), **three states** (unsorted / asc / desc), highlight the current sort column (`text-foreground` vs the rest `text-muted-foreground`). The sort control uses `Button variant="ghost" size="sm"`, not a bare `<button>`.
- **Rows**: separate with `border-b` (§6.2); hover `bg-accent` (§6.2); selectable rows use a leading `Checkbox` column + a persistent selected state `bg-accent` (distinct from hover, see §7.B).
- **Density**: compact by default (§4.1 "tighter preferred"); number columns `text-right tabular-nums`. Cell padding comes from `TableCell` — don't hand-set it.
- **Sticky header + overflow**: `TableHeader` is **sticky by default** (pinned + opaque `bg-muted`) — don't hand-add `sticky top-0`; make the body a vertical scroll region by giving the container a height — `<Table containerClassName="max-h-…">` (or `h-full` in a flex-fill page). The built-in container scrolls wide tables horizontally; the first column can be `sticky left-0`. **Forbid** a wide table breaking out of the page container.
- **Long lists**: expecting > ~100 rows use `Pagination` or virtualization, **don't** scroll unbounded; pick one per surface, don't mix.
- **Empty state**: a **widget** table (in a Card) keeps its header and shows the message in a **column-spanning body cell**; a **page-main** table (including filtered-to-zero) uses the **`Empty`** suite (§7.A.4) filling the region — never a bare header over an empty body. loading / error → §7.B.
- **Embedded in a Card**: when a Table goes directly into `CardContent`, **don't wrap another `border` container outside** (§6.2 omit border: the Card itself is the container, don't stack two borders). **Radius**: to soften the square corners (avoiding a clash with the Card's `rounded-xl` corners) wrap one layer of **`overflow-hidden rounded-md`, but no `border`** — `rounded-md ≤ rounded-xl` satisfies §6.3 outer≥inner, the `bg-muted/50` header gets clipped into a rounded cap. **Outer-column alignment + hover breathing** — `CardContent` uses `px-2` (not the default `px-4`), together with the cell's own `px-2`: first/last column content lands at 16px = aligned to `CardTitle` / action buttons; this 8px `CardContent` inset also makes the row hover / divider a "highlight lane" 8px wider than the content, **not hugging the text**. **Don't use** `[&_th:first-child]:pl-0` to clear outer-column padding — it aligns, but the first-column text hugs the row edge and the hover highlight sticks to the text (physically: for hover breathing the highlight must be wider than the content, so the divider ends up wider than the content, and you can't have both). **Bottom inset**: add `pb-2` to the Card — the default `py-4` (16px) bottom is wider than the table block's 8px side inset, `pb-2` drops the bottom to 8px aligned to both sides (the top keeps `pt-4` for header breathing). Header row layout (title left / actions right, `flex items-center justify-between`, not `CardAction`) follows the **Header row** bullet above.

```tsx
<Table containerClassName="rounded-md border">   {/* container owns scroll + border; TableHeader is sticky by default */}
  <TableHeader>
    <TableRow>
      <TableHead><Button variant="ghost" size="sm" className="-ml-2">Ticket <ChevronDown className="ml-1 h-3.5 w-3.5" /></Button></TableHead>
      <TableHead className="text-right">SLA</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-accent">
      <TableCell className="max-w-[280px] truncate" title={subject}>{subject}</TableCell>
      <TableCell className="text-right tabular-nums">98.2%</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

Table nested in a Card (e.g. a "Recent tickets" list) — header centered, `overflow-hidden rounded-md` softens the square corners (no border), outer columns aligned to the Card's `px-4` inset:

```tsx
<Card className="pb-2">  {/* pb-2: bottom inset 8px aligned to both sides (default py-4 bottom is too wide) */}
  {/* header: title+desc grouped left, actions right vertically centered (override CardHeader default grid) */}
  <CardHeader className="flex flex-row items-center justify-between gap-4">
    <div className="space-y-0.5">  {/* title↔caption: card tier gap (§3.2) */}
      <CardTitle>Recent tickets</CardTitle>
      <CardDescription>Selection · sortable · footer summary</CardDescription>
    </div>
    <div className="flex shrink-0 gap-2"><Button variant="outline">Filter</Button><Button>New</Button></div>  {/* toolbar controls = md/32px */}
  </CardHeader>
  <CardContent className="px-2">  {/* px-2 + cell px-2 = 16px alignment; hover highlight 8px wider than content */}
    <div className="overflow-hidden rounded-md">  {/* rounded corners, no border */}
      <Table>
        …{/* first column aligned to CardTitle, last column aligned to the New button */}
      </Table>
    </div>
  </CardContent>
</Card>
```

```tsx
<div className="rounded-md border"><Table>…</Table></div>      ❌ border container nested in a Card (double border; for rounded corners use rounded-md without border)
<CardHeader><CardTitle/><CardAction>…</CardAction></CardHeader>  ❌ CardAction top-aligns; list/table header needs flex centered
<CardContent><Table>…  {/* default px-4 */}                        ❌ px-4 + cell px-2 = 24px, first column indented one step more than the title (use px-2)
<Table className="[&_th:first-child]:pl-0 …">                   ❌ clearing outer-column padding aligns, but the hover highlight hugs the first-column text (no breathing)
```

#### 7.A.6 Forms — fields and error display

**Which to use**: 1–3 controls, no async validation → the `Field` suite; multiple fields / async / unified errors → the `Form` suite; when unsure use `Form`.
**Error display**: field error **inline below the field** + the input enters the destructive state; mark required consistently (asterisk *or* "optional", pick one); on a multi-field submit failure add an `Alert` summary at the top. **Don't** toast field validation errors (go inline).
**Progressive disclosure**: don't lay out complex / optional fields all at once — tuck advanced items into a `Collapsible` / folded area to lower cognitive load.

**DO / DON'T**

```tsx
<Field>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" type="email" />
  <FieldError>{error}</FieldError>
</Field>                                                  ✓ inline field error
<p className="text-red-500">{error}</p>                   ❌ raw color + raw HTML error
```

#### 7.A.7 Actions — hierarchy

One screen / one block has **only one primary action** (filled `Button`); the rest secondary (`outline`) / tertiary (`ghost` / `link`), so the operator sees the "main path" at a glance (cognitive load: the more primaries side by side, the slower the decision). Destructive actions (delete etc.) are separated from the main action **visually + spatially**, not side by side at the same tier.

**DO / DON'T**

```tsx
<div className="flex gap-2"><Button>Save</Button><Button variant="outline">Cancel</Button></div>   {/* ✓ one primary one secondary */}
<div className="flex gap-2"><Button>Save</Button><Button>Publish</Button><Button>Share</Button></div>   {/* ❌ three primaries fighting for focus */}
```

### 7.B Interaction & data states (loading / error / disabled / selected / overflow / focus)

§7.A.4 prescribes the **empty** state; its sibling states **must also be handled explicitly** — AI improvises the moment it hits async (which is the norm for this product), often falling into violations this document has already forbidden.

| State | Rule | Don't |
|---|---|---|
| **Loading** | when an async surface (Card / Table / Sheet / list) is pending render a **`Skeleton` matching the loaded layout shape** (row count / block shape close to the real thing); for transient small feedback use `Spinner` | raw "Loading…" text / hand-rolled spinner / a collapsed container (reflow on arrival) |
| **Error** (load failure, ≠ field validation error) | **explicit error affordance**: inline `Alert variant="destructive"`, or `Empty` + error icon + **Retry** | rendering a failure as empty (misleads as "0 data") / silent blank |
| **Disabled / read-only** | component's built-in `disabled` prop — the library owns the exact treatment (e.g. Button: `opacity-50` + `pointer-events-none`) and keeps it consistent + semantic | hand-simulating disabled on a raw element with `opacity-*` / `text-foreground/40` classes — no disabled semantics, and drifts from the library treatment |
| **Hover / Selected** | clickable rows / selectable cards / nav items must have a visible hover (`bg-accent`) + **persistent selected** (`bg-accent` + `border-primary` or a leading indicator bar, distinct from hover) | a static surface looking clickable / selected indistinguishable from hover |
| **Overflow / truncation** | see **§3.4** (truncate + `min-w-0` / wrap / break; truncate requires reveal; grid uses `minmax(0,1fr)`) | unbounded text breaking column width / grid (breaks `tabular-nums` alignment + §1 scan) |
| **Focus** | component carries a focus-visible ring, **don't override**; a custom focusable element (`div role="button"`) adds its own `focus-visible:ring-2 ring-ring ring-offset-2`, use `focus-visible:` not `focus:` | `outline-none` alone without adding a ring (keyboard focus invisible) |

> **a11y scope**: Phase 1 = focus ring + the states above; keyboard navigation / Tab order / ARIA / screen reader / auto contrast are deferred (not yet in scope).

**DO / DON'T**

```tsx
{isLoading ? (
  <div className="space-y-2"><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /></div>
) : error ? (
  <Alert variant="destructive"><AlertCircle className="size-4" /><AlertTitle>Failed to load</AlertTitle>
    <AlertDescription>{error.message} <Button variant="link" onClick={retry}>Retry</Button></AlertDescription></Alert>
) : <DataTable rows={rows} />}

<Button disabled>Save</Button>                                  ✓ built-in disabled
<div role="button" tabIndex={0} className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">…</div>  ✓ custom element adds focus ring
<div className="opacity-50 pointer-events-none">…</div>          ❌ hand-simulating disabled on a raw element (use the component's disabled prop)
<button className="outline-none">Save</button>                  ❌ turned off focus without adding a ring
```

---

## 8. Exceptions

§1–§7 are the rule body (read by people + AI coding tools). **Violation detection** (grep / severity / JSONL) is the audit skill's job, **not in this document**.

When a rule has a legitimate exception, add an inline comment marker **within ±2 lines** of the violating line; after the audit skill hits it, it is downgraded to `exception` (not counted as a violation). Both syntaxes are recognized: JSX `{/* ... */}` and line comment `// ...`.

marker list (use when writing an exception):

| marker | Applies | Meaning |
|---|---|---|
| `{/* fixed-hue: chart category */}` / `{/* fixed-hue: code-block */}` | §2.1 / §2.3 | chart category color / code-block fixed hue |
| `{/* arbitrary: <reason> */}` | §4.2 | legitimate arbitrary value (reason must be readable) |
| `{/* layout: <reason> */}` | §5 | legitimate use case for layout container width |
| `{/* TODO(playbook): <fix> */}` | multiple rules | to-fix placeholder |
| `{/* false-positive: §X.Y <reason> */}` | any | declares a false positive |

A marker keyword written but malformed (misspelled / missing reason) → the skill does **not** silently count a violation, but emits a visible `marker-syntax-warning` (P3). `{/* z-arb */}` is not supported (§6.4 z-index has no arbitrary-value exemption).
