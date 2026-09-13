---
"@ui-organized/table-core": minor
"@ui-organized/react-table": minor
---

**New: a data table**, shipped as two packages — `@ui-organized/table-core` (framework-free engine, owns the CSS) and `@ui-organized/react-table` (the React adapter).

It is deliberately outside `@ui-organized/react`. A table engine plus a virtualizer is a transitive dependency that every consumer of `Button` would otherwise pay for at install time, and the component library has 71 components that need none of it.

```ts
import "@ui-organized/tokens/variables.css";
import "@ui-organized/react/styles";
import "@ui-organized/react-table/styles";
```

`@ui-organized/react` is a **peer** of the adapter, not a dependency — two copies of the design system in one tree would mean duplicated global CSS and duplicated Ark context.

**Three layers.** `useDataTable()` is the headless hook and exposes the raw TanStack instance as its escape hatch; `Table` / `TableHeader` / `TableBody` / `TableRow` / … are the styled parts, flat-exported to match the repo's convention (`DialogContent`, never `Dialog.Content`); `<DataTable>` is the wrapper, and it composes exactly the parts a consumer would compose by hand.

**Real `<table>` semantics, virtualized.** Rows above the threshold are windowed with leading and trailing spacer rows inside `<tbody>`, rather than the usual `display: grid` plus absolute positioning — that approach destroys the implicit table roles and forces a hand-rolled ARIA grid, which is expensive to get right under a blocking axe gate. `aria-rowcount` and `aria-rowindex` report the position in the whole dataset, so a screen reader says "row 4,312 of 100,000" rather than "row 4 of 30".

**Two accessibility modes, chosen automatically.** A table with nothing operable in it stays a plain `table` inside a labelled, focusable scroll region. One with selection, inline edit or row activation becomes a `role="grid"` with roving tabindex — arrows, Home/End, Ctrl+Home/End, PageUp/PageDown (which also drive the virtualizer), Enter to activate or edit, Space to select, Shift+Arrow to extend a range.

**Filtering is composable, not a row of controls.** A filter is **identifier + relative + value** — "Role · is any of · Owner, Admin". Users start one from the icon-only funnel in the header, each becomes a `Chip` on the line below, and clicking a chip opens an editor holding its operator, its value and **Remove**. Several conditions may target one field and are ANDed, so "joined after X" and "joined before Y" is a window expressed as two independently removable chips. A condition with no value yet is shown but deliberately does not filter, so adding one never blanks the table. Faceted counts sit beside each enum value and reflect every _other_ applied filter, so they say what ticking that value would actually do; a value that would match nothing is disabled unless it is already selected. `meta.filter: true` is enough to expose a column — the type is inferred from the data — and the opt-in is structural, so `getCanFilter()` and the picker cannot disagree.

**The header row is yours on the left, the table's on the right.** `actions` takes your own buttons — each with whatever `intent` the page needs, so exactly one of them can be the call to action — and a vertical rule separates them from the table's own chrome: sort, filter, export, columns. The rule renders only when there is something on both sides of it. The sort menu is new and is on whenever any column is sortable: in table mode it duplicates the column headers, but in **card mode it is the only sort control there is**, and a table that silently loses sorting at 640px is a table that is broken on phones. Two **scroll buttons** close the row, and only while the viewport is actually hiding columns — a mouse with no horizontal wheel and an overlay scrollbar that paints only while it moves leave "there are more columns over there" as something the user has to guess at. Each half is disabled at its own end, and `useDataTable().scroll` carries the same state for a hand-built toolbar.

**In v1:** sorting, client and server filtering, global search, pagination, sticky header, pinned columns, toolbar scroll buttons when the columns run off the edge, row and range selection including "select all N matching", bulk actions, row actions, column resize / reorder / visibility, inline editing with optimistic rollback, a row detail sheet with a dirty guard, card mode below the breakpoint, CSV export and TSV clipboard copy, loading / empty / error states, and `manual` server mode with infinite scroll.

**Not in v1:** grouping and aggregation, expandable sub-rows, URL or localStorage state persistence.

**The framework boundary is enforced, not intended.** `table-core` owns the column model, the prop builders, every behaviour and the entire stylesheet, and imports no framework: ESLint bans `react`, `react-dom`, `@ui-organized/react` and the per-framework TanStack adapters from `packages/table-core/src/**`, and a unit test asserts the published manifest declares no framework dependency or peer. Adding a Vue table is then a new `packages/vue-table` depending on `table-core` plus `@tanstack/vue-table` — same class names, same stylesheet, same token contract, no fork of the logic.

`DataTableQuery.filters` reports the conditions verbatim — flat JSON primitives with an explicit operator, rather than an opaque per-column value a server would have to reverse-engineer. `JSON.stringify(query.filters)` is therefore a valid cache key or URL parameter. Relative dates arrive unresolved, because the server's clock is the authority; `resolveRelativeDates` is exported for consumers who prefer to pin them client-side.

**Dates are compared as the local calendar day they denote.** The date predicate reduces a `Date` using its local parts rather than `toISOString()`, which is UTC and reported the previous day for any `Date` built from local parts west of Greenwich. It also rejects a string that is not an ISO date instead of slicing it to ten characters and comparing the result — `"March 3, 2024"` was becoming `"March 3, "` and silently matching the wrong rows.

Every one of the 47 tokens in `packages/table-core/token-contract.json` is already required by `@ui-organized/react`, so no existing theme has to change.
