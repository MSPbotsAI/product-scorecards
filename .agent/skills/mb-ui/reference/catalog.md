# @mspbots/ui — full catalog & patterns

Everything below is exported from the package root: `import { X } from '@mspbots/ui'`.
Components are shadcn/Radix-based; compound components are used as a set of sub-parts.

## Forms & inputs

| Export | Purpose |
|---|---|
| `Button`, `buttonVariants` | Actions. Variants: `default \| destructive \| outline \| secondary \| ghost \| link`. Sizes: `default \| xs \| sm \| lg \| icon \| icon-xs \| icon-sm \| icon-lg`. Supports `asChild`. |
| `ButtonGroup` | Group buttons into a segmented control. |
| `Input` | Text input. Set `aria-invalid` for error styling. |
| `Textarea` | Multi-line input (auto-sizes). |
| `Label` | Accessible label (Radix). |
| `Checkbox` | Boolean checkbox. |
| `RadioGroup` | Single-choice group. |
| `Switch` | On/off toggle. |
| `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectSeparator` | Dropdown select. Pass `container={root()}` to `SelectContent`. |
| `Combobox` | Searchable/multi select. |
| `Slider` | Range slider. |
| `Toggle`, `ToggleGroup` | Toggle button(s). |
| `InputOTP` (+ parts) | One-time-code input. |
| `InputGroup` (+ `InputGroupAddon`/`Button`/`Text`/`Input`/`Textarea`) | Input with leading/trailing addons. |
| `Calendar` | Date picker calendar (react-day-picker). |
| `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField` | react-hook-form integration. |
| `Field`, `FieldSet`, `FieldLegend`, `FieldGroup`, `FieldLabel`, `FieldTitle`, `FieldContent`, `FieldDescription`, `FieldError`, `FieldSeparator` | Layout primitives for field rows (orientation `vertical \| horizontal \| responsive`). |

## Overlays & menus

| Export | Purpose |
|---|---|
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` | Modal. `DialogContent` takes `container={root()}` and `showCloseButton`. |
| `AlertDialog` (+ parts) | Confirm/destructive modal. |
| `Drawer` (+ parts) | Bottom/side drawer (Vaul). |
| `Sheet` (+ parts) | Side panel. |
| `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor` | Floating panel. `container={root()}`. |
| `HoverCard` (+ parts) | Hover popover. |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | Tooltips. `TooltipContent` takes `container={root()}`. |
| `DropdownMenu` (+ parts) | Button menu. |
| `ContextMenu` (+ parts) | Right-click menu. |
| `Menubar` (+ parts) | App menu bar. |
| `Command` (+ `CommandDialog`/`Input`/`List`/`Empty`/`Group`/`Item`/`Shortcut`/`Separator`) | Command palette (cmdk). |

## Data display

| Export | Purpose |
|---|---|
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` | Surface container. |
| `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` | Data table (wrapper handles overflow). |
| `Badge`, `badgeVariants` | Status pill. Variants `default \| secondary \| destructive \| outline \| ghost \| link`. |
| `Avatar`, `AvatarImage`, `AvatarFallback` | User avatar. |
| `Chart` (+ chart helpers) | Recharts wrapper. |
| `Carousel` | Embla carousel. |
| `Progress` | Progress bar. |
| `Skeleton` | Loading placeholder. |
| `Empty` | Empty-state block. |
| `Alert`, `AlertTitle`, `AlertDescription`, `alertVariants` | Inline alert. |
| `Item` | Generic list item. |
| `Kbd` | Keyboard key. |

## Navigation & layout

`Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`, `Breadcrumb` (+parts), `Pagination` (+parts),
`NavigationMenu` (+parts), `Accordion` (+parts), `Collapsible` (+parts), `Separator`,
`ScrollArea`, `Resizable` (+parts), `AspectRatio`, `Sidebar` (+ `SidebarProvider`, `useSidebar`).

> The app shell (sidebar/header) is provided by the layout system — see the `page`
> skill. You normally won't use `Sidebar` directly.

## Feedback

- `Toaster` + `toast` (sonner): render `<Toaster />` once, then `toast.success(...)`, `toast.error(...)`.
- `Spinner`: inline loading indicator.

## Helpers & hooks

- `cn(...classes)` — clsx + tailwind-merge; the standard way to compose/override classes.
- `root()` — the correct portal/container element (handles Wujie shadow DOM). Pass to overlay `container`.
- `embedded()` — true when embedded in the Wujie micro-frontend host.
- `useIsMobile()` — `boolean`, true under 768px.
- `useSidebar()` — sidebar state `{ state, open, setOpen, toggleSidebar, isMobile, … }`.
- `useFormField()` — current field state inside a `FormField`.
- `Permission` — render-gate by role: `<Permission roles={['admin']} fallback={null}>…</Permission>` (reads the globally-injected `useAccess()` from `@mspbots/react`, not an import from this package).
- `VisuallyHidden` — screen-reader-only content.

## Patterns

### Form (react-hook-form)

```tsx
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, Input, Button } from '@mspbots/ui'

function ProfileForm() {
  const form = useForm({ defaultValues: { email: '' } })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  )
}
```

### Dialog (portaled)

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, root } from '@mspbots/ui'

<Dialog>
  <DialogTrigger asChild><Button variant="destructive">Delete</Button></DialogTrigger>
  <DialogContent container={root()}>
    <DialogHeader><DialogTitle>Delete item?</DialogTitle></DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Select (portaled)

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, root } from '@mspbots/ui'

<Select value={v} onValueChange={setV}>
  <SelectTrigger><SelectValue placeholder="Pick a role" /></SelectTrigger>
  <SelectContent container={root()}>
    <SelectItem value="admin">Admin</SelectItem>
    <SelectItem value="user">User</SelectItem>
  </SelectContent>
</Select>
```

### Table

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@mspbots/ui'

<Table>
  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead></TableRow></TableHeader>
  <TableBody>
    {rows.map(r => <TableRow key={r.id}><TableCell>{r.name}</TableCell><TableCell>{r.email}</TableCell></TableRow>)}
  </TableBody>
</Table>
```

## Theme tokens

Use these semantic classes (defined in the virtual `styles.css` the plugin generates — see the `mb-ui` `SKILL.md`; adapt to light/dark):

`background`/`foreground`, `card`/`card-foreground`, `popover`/`popover-foreground`,
`muted`/`muted-foreground`, `primary`/`primary-foreground`, `secondary`/`secondary-foreground`,
`accent`/`accent-foreground`, `destructive`/`destructive-foreground`, `border`, `input`, `ring`,
`sidebar*`, and `chart-1`…`chart-5`. Radius via `rounded-*` (driven by `--radius`).
Theme primary/radius are configured in `vite.config.ts` → `react({ theme })`.
