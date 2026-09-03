# @ui-organized/react-table

The React data table for the ui-organized design system.

Real `<table>` semantics, virtualized to 100,000 rows, composed from the
component library's own controls — `Checkbox`, `Menu`, `Sheet`, `Pagination`,
`Button`, `Input`, `Toolbar`, `Skeleton`, `AlertDialog`.

## Install

```bash
pnpm add @ui-organized/react-table
```

`@ui-organized/react` is a **peer**, not a dependency: two copies of the design
system in one tree would mean duplicated global CSS and duplicated Ark context.

```ts
import "@ui-organized/tokens/variables.css";
import "@ui-organized/react/styles";
import "@ui-organized/react-table/styles";
```

## Three layers

**The wrapper** — the whole table from a props object:

```tsx
import { DataTable, type TableColumn } from "@ui-organized/react-table";

const columns: TableColumn<Member>[] = [
  // `filter: true` is enough — the type is inferred from the data.
  { accessorKey: "name", header: "Name", meta: { primary: true, filter: true } },
  { accessorKey: "role", header: "Role", meta: { filter: { type: "enum" } } },
  { accessorKey: "seats", header: "Seats", meta: { align: "end" } },
];

<DataTable
  label="Team members"
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
  selection="multiple"
  bulkActions={[
    { id: "archive", label: "Archive", icon: "trash", destructive: true, onRun: archive },
  ]}
  detail={{ render: (row) => <MemberFields row={row} /> }}
  onEdit={(patch) => api.update(patch)}
/>;
```

**The parts**, flat-exported to match the repo's convention (`TableHeader`, not
`Table.Header`). `<DataTable>` composes exactly these, which is the test of
whether the layer is real:

```tsx
const table = useDataTable({ label: "Team members", columns, data });

<TableProvider value={table}>
  <Table>
    <TableToolbar />
    <TableSelectionBar />
    <TableViewport>
      <TableHeader />
      <TableBody />
    </TableViewport>
    <TablePagination />
  </Table>
</TableProvider>;
```

**The hook**, when you want the state and none of the markup. `table` is the raw
TanStack instance, exposed deliberately as the escape hatch:

```tsx
const { table, rows, selection, edit, detail, exportCsv } = useDataTable({ … });
```

## Your data

The table takes an **array of objects, one per row**. There is no required shape — no `id`
field, no particular key names — because a column says how to reach its own value.

```tsx
const members = [
  { id: "m1", name: "Ada Lovelace", role: "Engineer", seats: 3, joined: "2024-01-15" },
  // …
];
```

Two rules about the array itself, and they matter more than anything else on this page:

```tsx
// ✅ stable references
const columns = useMemo(() => [...], []);
const { data } = useQuery(...);

// ❌ a new array every render
<DataTable columns={[{ accessorKey: "name" }]} data={rows.filter(Boolean)} />
```

Every row model — filtering, sorting, pagination, the virtualizer — is memoized on those
two references. Rebuilding either on each render recomputes all of it on every keystroke.
The table warns in development when it detects `data` or `columns` changing identity while
their contents plainly have not.

**Give it `getRowId`.** Selection, inline edit and the detail sheet are keyed by it. Without
one, rows are identified by _position_, so sorting or filtering silently moves a selection
onto different rows.

```tsx
<DataTable getRowId={(row) => row.id} … />
```

## Reaching a value

|                                 |                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `accessorKey: "name"`           | A top-level key                                                               |
| `accessorKey: "profile.city"`   | A dot path into nested data                                                   |
| `accessorFn: (row) => …` + `id` | Anything computed. `id` is required, since there is no key to derive one from |

```tsx
const columns: TableColumn<Member>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true } },
  { accessorKey: "profile.city", header: "City" },
  { id: "fullName", accessorFn: (row) => `${row.first} ${row.last}`, header: "Name" },
];
```

Exactly one column should set `meta.primary`. That column becomes the row header
(`<th scope="row">`), the card title in card mode, and the column pinned left when the
table scrolls horizontally — so pick the one that identifies the row to a human.

## What each type renders as

A cell with no `cell` renderer is stringified. That is fine for most values and wrong for
two of them:

| Value                | Renders as                              |                                           |
| -------------------- | --------------------------------------- | ----------------------------------------- |
| `"Ada"`              | `Ada`                                   |                                           |
| `42`, `0`            | `42`, `0`                               | zero is not treated as empty              |
| `true` / `false`     | `true` / `false`                        | usually wants a `cell` renderer           |
| `null` / `undefined` | _(empty)_                               |                                           |
| `"2024-01-15"`       | `2024-01-15`                            | ISO strings are the easiest dates to hold |
| `new Date(…)`        | `Mon Jan 15 2024 00:00:00 GMT-0600 (…)` | **format this**                           |
| `{ … }` / `[…]`      | `[object Object]`                       | **format this**                           |

A `Date` is the one that bites: the default rendering is long, and it is _timezone
dependent_, so the same row reads differently on two machines and any screenshot test of it
is unstable. Format it, or hold the date as an ISO string in the first place.

```tsx
{
  accessorKey: "joined",
  header: "Joined",
  // A cell renderer is just a component — compose the library freely.
  cell: ({ getValue }) => getValue<Date>().toLocaleDateString(),
}
```

## Telling it what the data _is_

`meta.filter` gives a column a filter. `true` is enough — the type is inferred from the
first non-empty values in the column:

| Data                                             | Inferred  |
| ------------------------------------------------ | --------- |
| `true` / `false`                                 | `boolean` |
| `3`, `7`                                         | `number`  |
| `Date`, `"2024-01-15"`, `"2024-01-15T09:30:00Z"` | `date`    |
| anything else                                    | `text`    |
| any column declaring `filter.options`            | `enum`    |

Leading `null`s are skipped rather than deciding the type. Three cases need an explicit
`type`, because inference cannot see them:

- **Numbers stored as strings.** `"9"` and `"10"` infer as `text`, and text compares
  lexicographically — so `"9" > "10"` is _true_. Declare `{ type: "number" }`.
- **`accessorFn` columns.** Inference reads the row, and a computed value is not in it, so
  it falls back to `text`. (A dot path is followed, so nested data infers normally.)
- **Enums.** A low-cardinality text column is _not_ promoted to `enum` automatically:
  cardinality changes as data streams in, and the editor's whole shape would flip
  mid-session. Declare `{ type: "enum" }`, or supply `options`.

The same declaration drives sorting and export, so getting it right once fixes all three.

## Column `meta` reference

Everything table-specific lives under `meta`, so the rest of the column definition stays
TanStack's.

| Key                               |                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------- |
| `primary`                         | The identifying column: row header, card title, pinned on narrow viewports        |
| `align`                           | `"start"` (default), `"center"`, `"end"` — numbers usually want `"end"`           |
| `width` / `minWidth` / `maxWidth` | Pixels. Widths are explicit so rows cannot jitter as virtualized rows swap in     |
| `sticky`                          | `"left"` or `"right"` — pins the column while the rest scrolls                    |
| `priority`                        | Order within a card in card mode. Lower first                                     |
| `filter`                          | `true`, or `{ type, operators, defaultOperator, options, label, single, counts }` |
| `edit`                            | `{ render, validate }` — makes the cell editable in place                         |
| `exportValue`                     | `(row) => …` — what CSV and the clipboard use instead of the cell value           |
| `hideFromViewOptions`             | Keep the column out of the show/hide menu                                         |

```tsx
{
  accessorKey: "seats",
  header: "Seats",
  meta: {
    align: "end",
    width: 100,
    filter: { type: "number", operators: ["between", "gte"] },
    // The rendered cell may be a component; the export should be a number.
    exportValue: (row) => row.seats,
  },
}
```

`exportValue` is worth setting on any column with a `cell` renderer. Export falls back to
the raw value, which for a status column rendered as a `<Tag>` is usually right — but for a
column whose renderer _derives_ what it shows, the raw value is not what the user sees.

## What it does

|                                      |                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| Sorting and global search            | Column headers carry `aria-sort`; a header sort menu too; search runs deferred        |
| Filtering                            | Composable `Chip`s under the header — see below                                       |
| Pagination                           | Wraps `Pagination`, converts row count to page count                                  |
| Virtualization                       | On above 50 rows; spacer rows, so table semantics survive                             |
| Selection                            | Shift-range, and "select all 40,000 matching" for server tables                       |
| Bulk actions                         | A `Toolbar` that appears with a selection; destructive routes through `AlertDialog`   |
| Column resize / reorder / visibility | Resize handle is a focusable `role="separator"`, not a drag-only target               |
| Inline editing                       | Optimistic, with rollback on a rejected `onEdit`                                      |
| Row detail                           | A `Sheet` with prev/next and a dirty guard                                            |
| Responsive                           | Cards below the breakpoint; pinned first column above it                              |
| Horizontal scroll                    | Toolbar arrows while columns run off the edge; absent when everything fits            |
| Export                               | CSV download and TSV clipboard, respecting filters, sort and visibility               |
| Server mode                          | `manual` reports `{ sorting, filters, pagination }`; `onLoadMore` for infinite scroll |

## The header

One row of controls above the table, and — once something is filtered — a line of chips
under it.

```
[ Search            ]   [ your actions ] │ [sort] [filter] [export] [columns] [‹][›]
Filters  (Role is any of Owner, Admin)  (Joined is after 2021-01-01)   ＋ Add   ↺ Reset
```

`actions` are yours; everything right of the rule belongs to the table. The rule appears
only when there is something on both sides of it.

```tsx
<DataTable
  label="Team members"
  columns={columns}
  data={members}
  actions={[
    { id: "import", label: "Import", intent: "secondary", onRun: importMembers },
    { id: "invite", label: "Invite member", intent: "primary", icon: "plus", onRun: invite },
  ]}
/>
```

Each action takes whatever `intent` the page needs — usually exactly one of them is the
call to action and the rest recede — plus an optional `icon`, `disabled`, and `iconOnly`
to drop the visible label while keeping it as the accessible name. They render as real
buttons rather than an overflow menu, because these are the actions a page is _for_.

`sortMenu` is on whenever any column is sortable. In table mode it duplicates the column
headers; in **card mode it is the only sort control there is**, which is why it is not
opt-in.

The last pair are the **scroll buttons**, and they are there only while the viewport is
actually hiding columns — a table whose columns all fit never renders them. They move most
of a viewport width at a time, keeping the trailing columns in view so the movement reads
as a scroll rather than a jump, and each half is disabled at its own end. The scrollbar
still works; this is the half of it that is visible without a horizontal wheel, and the
half that says "there is more over there" before anyone thinks to look.

The state behind them is on the hook, so a hand-built toolbar can render its own control:

```tsx
const { scroll } = useDataTable({ … });
// { overflowing, canScrollLeft, canScrollRight, by: (direction: -1 | 1) => void }
```

## Filtering

A filter is **identifier + relative + value** — "Role · is any of · Owner, Admin". Users
start one from the funnel in the header, each becomes a `Chip` on the line below, and
clicking a chip opens an editor holding its operator, its value, and **Remove**.

The relation is **drawn** for the six operators the design system has a glyph for — `is`,
`is any of`, `contains`, `does not contain`, `starts with`, `ends with` — and written for
the rest, because there is no glyph for "is in the last 7 days" that anyone would read
correctly. The words stay the glyph's accessible name either way, so the chip reads as
"Name contains ada" whether it is seen or heard. A custom operator can name a glyph too:

```ts
filterOperators={[{ id: "matches", label: "matches", icon: "contains", /* … */ }]}
```

```tsx
{ accessorKey: "joined", header: "Joined", meta: { filter: true } }              // inferred
{ accessorKey: "role",   header: "Role",   meta: { filter: { type: "enum" } } }  // declared
{ accessorKey: "seats",  header: "Seats",  meta: {
  filter: { type: "number", operators: ["between", "gte"], defaultOperator: "between" },
} }
```

Only columns with `meta.filter` are offered, and the opt-in is structural — a column
without it has `getCanFilter() === false`, so the picker and the engine cannot disagree.
It stays reachable by the global search either way.

- **Several conditions may target one field**, and they are ANDed: "joined after X" and
  "joined before Y" is a window, expressed as two independently removable chips.
- **A condition with no value does not filter.** Adding one never blanks the table; the
  chip renders with a dashed border until it is complete.
- **Faceted counts** sit next to each enum value ("Platform · 12") and reflect every
  _other_ applied filter, so they say what ticking that value would actually do. A value
  that would match nothing is disabled — unless it is already selected, which would leave
  the user unable to untick it.
- **`defaultFilters`** seeds the chips, and is the only way to render one in a static
  surface such as a snapshot test.
- **`filterOperators`** registers extra operators, or replaces a built-in of the same id —
  which is also how every label core produces gets localized.

Server-driven tables receive the conditions verbatim through `onQueryChange`, as flat JSON
primitives, so `JSON.stringify(query.filters)` is a valid cache key or URL parameter.
Relative dates (`in-last`) arrive unresolved, because the server's clock is the authority;
`resolveRelativeDates` is exported for consumers who would rather pin them client-side.

## Accessibility

Two modes, chosen automatically. A table with nothing operable in it is a plain
`table` inside a labelled, focusable scroll `region`. One with selection, inline
edit or row activation becomes a `role="grid"` with roving tabindex: arrows move
the focused cell, Home/End and Ctrl+Home/End reach the bounds, PageUp/PageDown
move a viewport page and drive the virtualizer, Enter activates or edits, Space
toggles selection, Shift+Arrow extends a range.

A filter chip is the design system's `Chip`, and it is deliberately **one** control: the
whole pill opens its editor, and removal lives inside that editor rather than in a second
hit area within a 20px target. (`Chip` does support a dismiss button, as a _sibling_ of
its body — never nested, which would be invalid HTML and an axe `nested-interactive`
violation.) Each editor is a dialog named after its field, its operator and value controls
keep real labels that are hidden visually rather than dropped, and adding or removing a
filter is announced in a polite live region.

The header's filter and sort buttons are icon-only, so their `aria-label` is their whole
name — and, because zag names a menu after its trigger, the menu's name too.

`aria-rowcount` and `aria-rowindex` report the position in the whole dataset, not
in the rendered window — so a screen reader says "row 4,312 of 100,000" rather
than "row 4 of 30". The identifying column (`meta.primary`) is a real
`<th scope="row">`, and the `<caption>` is always present, visually hidden unless
`captionVisible` is set.

## Licence

Apache-2.0
