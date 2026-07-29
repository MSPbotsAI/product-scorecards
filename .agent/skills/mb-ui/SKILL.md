---
name: mb-ui
description: Build the interface of an MSPBots app with the @mspbots/ui component library (a 56-component shadcn/Radix set). Use when creating or styling any UI — buttons, forms, inputs, dialogs/modals, drawers, tables, cards, tabs, selects, dropdowns, toasts, tooltips, badges, charts, etc. — or when the user asks which component to use, how to theme, or about dark mode. Covers the component catalog, the cn() helper, compound-component patterns, overlay portals, forms, and the semantic Tailwind theme tokens.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# UI (@mspbots/ui component library)

`@mspbots/ui` is the app's design system — a shadcn/Radix-based set of 56 components
plus helpers. **Build every interface from these components.** Do not hand-roll a
button/input/dialog/table that the library already provides, and do not pull in another
UI kit.

## Hard rules

- **Import from the package root only:** `import { Button, Card, cn } from '@mspbots/ui'`. Never deep-import a component file.
- **Never import CSS or set up Tailwind.** The toolchain-owned `styles.css` already pulls in Tailwind + `@mspbots/ui/styles` + `@mspbots/layout/styles` + the full theme (loaded once by the virtual entry). Adding another `import '@mspbots/ui/styles'` or a tailwind config is wrong.
- **Use the semantic theme tokens, never hardcoded colors.** Use `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`/`text-primary-foreground`, `bg-secondary`, `bg-accent`, `bg-destructive`, `bg-sidebar`, and `chart-1`…`chart-5`. Never `#fff`, `bg-white`, `text-black`, etc.
- **Dark mode is automatic** via the `.dark` class (next-themes; toggled in the sidebar). Tokens already adapt; only add `dark:` utilities for genuine one-offs.
- **Compose, merge classes with `cn()`** (clsx + tailwind-merge): `className={cn('px-3', active && 'bg-accent', className)}`.
- **Overlays in this app must portal to `root()`** (Wujie/shadow-DOM safe): pass `container={root()}` to `DialogContent`, `SelectContent`, `PopoverContent`, `TooltipContent`, etc. `import { root } from '@mspbots/ui'`.
- Icons come from `lucide-react` (already a dependency): `import { Plus } from 'lucide-react'`.

## Catalog

See [`reference/catalog.md`](reference/catalog.md) for the full categorized list of every
exported component, helper, and hook, plus copy-paste patterns (form, dialog, select,
table, toast). Quick map:

- **Forms:** `Button` (+`buttonVariants`), `Input`, `Textarea`, `Label`, `Checkbox`, `RadioGroup`, `Switch`, `Select`, `Combobox`, `Slider`, `Toggle`/`ToggleGroup`, `InputOTP`, `InputGroup`, `Calendar`, plus `Form*` (react-hook-form) and `Field*`.
- **Overlays:** `Dialog`, `AlertDialog`, `Drawer`, `Sheet`, `Popover`, `HoverCard`, `Tooltip`, `DropdownMenu`, `ContextMenu`, `Menubar`, `Command`.
- **Data display:** `Card`, `Table`, `Badge` (+`badgeVariants`), `Avatar`, `Chart` (recharts), `Carousel`, `Progress`, `Skeleton`, `Empty`, `Alert`, `Item`, `Kbd`.
- **Navigation/layout:** `Tabs`, `Breadcrumb`, `Pagination`, `NavigationMenu`, `Accordion`, `Collapsible`, `Separator`, `ScrollArea`, `Resizable`, `AspectRatio`, `Sidebar`.
- **Feedback:** `Toaster` + `toast` (sonner), `Spinner`.
- **Helpers:** `cn`, `root`, `embedded`; hooks `useIsMobile`, `useSidebar`, `useFormField`; `Permission` (role-gated render), `VisuallyHidden`.

## Minimal patterns

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label, cn } from '@mspbots/ui'

<Card>
  <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
  <CardContent className="space-y-3">
    <div className="space-y-1.5">
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Jane" />
    </div>
    <Button>Save</Button>
  </CardContent>
</Card>
```

Compound components are used as a set (`Card`/`CardHeader`/`CardContent`,
`Dialog`/`DialogTrigger`/`DialogContent`, `Select`/`SelectTrigger`/`SelectContent`/`SelectItem`,
`Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`). Variants are props: `<Button variant="outline" size="sm">`.

Toasts need the provider once and the imperative call:

```tsx
import { Toaster, toast } from '@mspbots/ui'
// place <Toaster /> once near the page root, then:
toast.success('Saved')
```

## Checklist

- [ ] components imported from `@mspbots/ui` root
- [ ] no manual CSS / Tailwind setup
- [ ] colors use theme tokens (no hardcoded hex / `bg-white`)
- [ ] overlays pass `container={root()}`
- [ ] class lists merged with `cn()`

## Common issues

- **Styles missing / unstyled** → you tried to set up Tailwind or import CSS yourself; remove it — the system injects everything.
- **Dialog/Select renders behind content or escapes shadow DOM** → pass `container={root()}`.
- **Colors don't switch in dark mode** → you hardcoded a color; switch to a token.
- **Form not validating** → use `Form` + `FormField` + `FormMessage` with `react-hook-form` (see catalog).
