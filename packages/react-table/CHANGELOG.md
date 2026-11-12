# @ui-organized/react-table

## 6.1.0

### Patch Changes

- Body cells now move with their headers. Before, reordering, hiding or pinning a column changed the header row but left every body row as it was, so the cells sat under the wrong headers until something else re-rendered the row.
  - @ui-organized/table-core@6.1.0

## 6.0.0

### Major Changes

- 83201b5: **Icons use your icon library's own names. Nothing is renamed any more.**

  `<Icon name>` and every `icon` prop now take the name the icon library publishes: `x` and `trash-2` in Lucide, `x-mark` and `trash` in Heroicons. The design system's own vocabulary of 62 renamed icons (`close`, `edit`, `alert-circle` and so on) is gone, along with the 62-icon ceiling it put on what you could name.

  Register the icons you use, once, from the library's subpath. Only what you register reaches your bundle:

  ```ts
  import { registerIcons } from "@ui-organized/react/icons/lucide";
  import { ChevronDown, Trash2, X } from "lucide-react";

  registerIcons({ ChevronDown, Trash2, X }); // "chevron-down", "trash-2", "x"
  ```

  The name is read off the export. The few exports whose digits can't be read back unambiguously, such as `ArrowDown01` (`arrow-down-0-1`), are registered by name instead: `registerIcons({ "arrow-down-0-1": ArrowDown01 })`. Passing a component directly (`<Icon name={X} />`) still works and needs no registration.

  **What doesn't change:** the components' own icons, such as a dialog's close button, a select's chevron or an alert's status icon. They come from the subpath import as before and still follow `IconProvider library`, with no registration.

  **What does change when you switch library:** your own names don't translate, because each belongs to the library you took it from. Register the new library's icons and use its names.

  An unregistered name renders nothing and, in development, logs the names that are registered.

  ### Migrating

  Replace each old name with your library's own. The common ones in Lucide (as `lucide-react@0.x` names them):

  | Was                      | Lucide                            |
  | ------------------------ | --------------------------------- |
  | `close`                  | `x`                               |
  | `edit`                   | `pencil`                          |
  | `trash`                  | `trash-2`                         |
  | `refresh`                | `refresh-cw`                      |
  | `undo` / `redo`          | `undo-2` / `redo-2`               |
  | `check-circle`           | `circle-check-big`                |
  | `alert-circle`           | `circle-alert`                    |
  | `alert-triangle`         | `triangle-alert`                  |
  | `loader`                 | `loader-circle`                   |
  | `home`                   | `house`                           |
  | `grid`                   | `grid-2x2`                        |
  | `unlock`                 | `lock-open`                       |
  | `sort-asc` / `sort-desc` | `arrow-up-a-z` / `arrow-down-a-z` |
  | `sort`                   | `list-filter`                     |

  Names such as `check`, `plus`, `search` and `chevron-down` are already Lucide's own and need only registering. For Tabler and Heroicons, use the names on tabler.io and heroicons.com.

  ### Removed
  - `CANONICAL_ICON_NAMES`, `CanonicalIconName`, `ICON_MAP`, `IconLibraryNames` and `resolveIconName` from `@ui-organized/utils`.
  - `resolveIconComponent` from `@ui-organized/core`. `IconSet.outline` and `IconSet.solid` now hold only the components' own icons.

  ### Added
  - `registerIcons` from each `icons/<library>` subpath, and `registerLibraryIcons(library, icons)` from the main entry for setups that pass `icons` explicitly.
  - `IconName` type, and `toNativeName(library, exportName)`, which shows the name an export registers under.
  - React, Vue and Svelte: `Menu`, `ContextMenu`, `Toggle`, `SegmentedControl`, `Breadcrumb`, `TreeView` and `Navigation` `icon` props accept a component as well as a name, as `Button` and `Tag` already did.
  - React: `useIconConfig` is exported.

- 2a6ea22: **Ten packages move to one version line at 6.0.0.**

  Nine of them have never been published. The tenth, `@ui-organized/react`, was at 5.1.0 and is the reason the shared line starts at 6: a group cannot go backwards, so it takes the highest version in it and moves up together.

  **This is a renumbering, not a breakage — and it is worth being exact about that.** `@ui-organized/react`'s public API is unchanged: nothing was removed from its barrel (96 export lines became 140), its `exports` map is byte-identical, and its peer dependencies are untouched. The only change to its manifest is internal — it now depends on `@ui-organized/core` instead of `class-variance-authority`. If you are upgrading from 5.1.0 and only use `@ui-organized/react`, there is no migration: install, and the same imports resolve to the same things.

  The reason for the major is that **the design system stopped being one library.** Ten packages that ship together and depend on each other by exact version are much easier to reason about on one line than on ten, and the alternative — `react` at 5.2.0 beside `core` at 0.2.0 and `react-table` at 1.0.0 — makes "which versions go together" a question every consumer has to answer from a changelog.

  **What is actually new.** `@ui-organized/core` holds the CSS, the style recipes and the token contract, and the four framework libraries render against it: `@ui-organized/react`, `@ui-organized/svelte`, `@ui-organized/vue` and `@ui-organized/angular`, each with the same 68 components. The data table ships as an engine (`@ui-organized/table-core`) plus one adapter per framework. Every one of those is checked against React's DOM by a parity harness rather than asserted — the four libraries render the same markup, carry the same ARIA and answer the same keys, and the gates that prove it run on every commit.

  `@ui-organized/core` is a **dependency** of each framework library, not a peer, so nobody has a new install step and no import path changed. `@ui-organized/tokens` and `@ui-organized/utils` keep their own version lines: they are consumed by things outside this group.

### Minor Changes

- c5c2036: **New: a data table**, shipped as two packages — `@ui-organized/table-core` (framework-free engine, owns the CSS) and `@ui-organized/react-table` (the React adapter).

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

  **Filtering is composable, not a row of controls.** A filter is **identifier + relative + value** — "Role · is any of · Owner, Admin". Users start one from the icon-only funnel in the header, and each becomes a segmented `Chip` on the line below: the field segment opens a menu of columns (plus **Remove filter**), the operator segment a menu of operators, and the value segment the value editor. Several conditions may target one field and are ANDed, so "joined after X" and "joined before Y" is a window expressed as two independently removable chips. A condition with no value yet is shown but deliberately does not filter, so adding one never blanks the table. Faceted counts sit beside each enum value and reflect every _other_ applied filter, so they say what ticking that value would actually do; a value that would match nothing is disabled unless it is already selected. `meta.filter: true` is enough to expose a column — the type is inferred from the data — and the opt-in is structural, so `getCanFilter()` and the picker cannot disagree.

  **The header row is yours on the left, the table's on the right.** `actions` takes your own buttons — each with whatever `intent` the page needs, so exactly one of them can be the call to action — and a vertical rule separates them from the table's own chrome: sort, filter, export, columns. The rule renders only when there is something on both sides of it. The sort menu is new and is on whenever any column is sortable: in table mode it duplicates the column headers, but in **card mode it is the only sort control there is**, and a table that silently loses sorting at 640px is a table that is broken on phones. Two **scroll buttons** close the row, and only while the viewport is actually hiding columns — a mouse with no horizontal wheel and an overlay scrollbar that paints only while it moves leave "there are more columns over there" as something the user has to guess at. Each half is disabled at its own end, and `useDataTable().scroll` carries the same state for a hand-built toolbar.

  **In v1:** sorting, client and server filtering, global search, pagination, sticky header, pinned columns, toolbar scroll buttons when the columns run off the edge, row and range selection including "select N hidden rows", bulk actions, row actions, column resize / reorder / visibility, inline editing with optimistic rollback, a row detail sheet with a dirty guard, card mode below the breakpoint, CSV export and TSV clipboard copy, loading / empty / error states, and `manual` server mode with infinite scroll.

  **Not in v1:** grouping and aggregation, expandable sub-rows, URL or localStorage state persistence.

  **The framework boundary is enforced, not intended.** `table-core` owns the column model, the prop builders, every behaviour and the entire stylesheet, and imports no framework: ESLint bans `react`, `react-dom`, `@ui-organized/react` and the per-framework TanStack adapters from `packages/table-core/src/**`, and a unit test asserts the published manifest declares no framework dependency or peer. Adding a Vue table is then a new `packages/vue-table` depending on `table-core` plus `@tanstack/vue-table` — same class names, same stylesheet, same token contract, no fork of the logic.

  `DataTableQuery.filters` reports the conditions verbatim — flat JSON primitives with an explicit operator, rather than an opaque per-column value a server would have to reverse-engineer. `JSON.stringify(query.filters)` is therefore a valid cache key or URL parameter. Relative dates arrive unresolved, because the server's clock is the authority; `resolveRelativeDates` is exported for consumers who prefer to pin them client-side.

  **Dates are compared as the local calendar day they denote.** The date predicate reduces a `Date` using its local parts rather than `toISOString()`, which is UTC and reported the previous day for any `Date` built from local parts west of Greenwich. It also rejects a string that is not an ISO date instead of slicing it to ten characters and comparing the result — `"March 3, 2024"` was becoming `"March 3, "` and silently matching the wrong rows.

  Every one of the 54 tokens in `packages/table-core/token-contract.json` is already required by `@ui-organized/react`, so no existing theme has to change.

- **The data table: column reordering, a selection footer, and date columns in any format.** All three are in every adapter, on the same engine.

  **Reordering columns.** `reorderable` lets people rearrange the columns, and every way of doing it moves one column and stops at the same places:
  - Drag a header onto another. A line on the near or far edge shows where it lands.
  - Click the header's ‹ › buttons, which step it one place, past any hidden column.
  - Press Alt+← / Alt+→ on a focused header, in an interactive table, where the header's buttons are not tab stops of their own.

  ```tsx
  <DataTable reorderable … />          // or "always": movable at any time
  <DataTable reorderable="toggle" … /> // only inside a reorder mode
  ```

  With `true` or `"always"`, the move buttons appear when a header is hovered or focused. With `"toggle"`, the toolbar gets a **Reorder** button (`TableReorderToggle`), and **Done** puts the buttons away again, for tables whose headers are busy enough that a stray drag would surprise. The table's own columns (the checkbox and row actions) and pinned columns never move, and **Reset column order** is in the Columns menu. The headless layer's `reorder` (`useDataTable().reorder` in React) exposes the same state for a hand-built header. The ordering itself (`stepColumn`, `dropColumn`, `isMovableColumn` and the rest) is in `@ui-organized/table-core`.

  **The selection footer.** While rows are selected, `TableSelectionFooter` under the rows counts them and offers to reach past the page: "Select 99,981 hidden rows". It counts the rows it would _add_, not the matching total, because the total reads as though the rows on screen were not already in it. The bulk actions stay in the toolbar row, where they replace the sort, filter and table controls until the selection is cleared. `<DataTable>` places the footer for you.

  The header checkbox now acts on what it shows. From empty it selects the rows in view; from checked or mixed it clears the **whole** selection, including rows on other pages or scrolled out of a virtualized window. It shows mixed whenever anything is selected short of every row in view, including rows out of view, so a selection can always be cleared from the header.

  **Date columns in any format.** Inside the table a date is always an ISO day, `YYYY-MM-DD`, which is what lets 100,000 rows sort and filter without building a `Date` per row. `meta.date` converts on both sides of that:
  - **`parse`** reads whatever the data holds (`"11/10/2026"`, a timestamp, `{ y, m, d }`) and returns a `Date` or an ISO string. It is not needed when the data is already a `Date` or ISO.
  - **`format`** is how the date reads, as `Intl.DateTimeFormat` options (with `locale`) or a function. The cell, the filter chip and the CSV export all use it, so they never disagree.

  ```tsx
  {
    accessorKey: "joined", // "11/10/2026"
    header: "Joined",
    meta: {
      filter: true, // a date filter, no `type` needed
      date: {
        parse: (value) => {
          const [m, d, y] = String(value).split("/").map(Number);
          return y ? new Date(y, m - 1, d) : null;
        },
        format: { dateStyle: "medium" }, // "Nov 10, 2026"
        locale: "en-US",
      },
    },
  }
  ```

  `date: true` marks a column as dates without changing how they read. A column's own `cell` still wins and receives the ISO day from `getValue()`, as does inline editing's `onEdit`. Global search matches the ISO day, not the formatted text. `TableDateDef` and `TableDateSetting` are exported from every adapter.

  Also:
  - **Card mode has sheets.** Sort and Filter are labelled buttons that each open a bottom sheet (`TableSortSheet`, `TableFilterSheet`). The filter sheet lists every filterable field at once, and a badge on the button says how many filters are applied.
  - A date filter's calendar opens above its editor. It was portalled to `<body>` on the same tier as the editor, which painted over it.

- 64db6a0: **The data table, for the other three frameworks.** `@ui-organized/vue-table`, `@ui-organized/svelte-table` and `@ui-organized/angular-table` join `@ui-organized/react-table`, all four on the same `@ui-organized/table-core`.

  ```ts
  import "@ui-organized/tokens/variables.css";
  import "@ui-organized/vue/styles"; // or svelte, or angular
  import "@ui-organized/vue-table/styles";
  ```

  The promise the table's first changeset made — _"same class names, same stylesheet, same token contract, no fork of the logic"_ — is now checked rather than asserted. Every scenario in the parity harness's `DataTable` suite compares all four libraries against React's DOM, and nothing is skipped: the four tables render the same markup, carry the same ARIA and respond to the same keys.

  Each adapter has the same three layers as React's. The headless one is spelled the way its framework spells things — `useDataTable(options)` reading its options reactively, `createDataTable(() => options)` returning getters over `$derived`, `createDataTable(options)` returning signals — and everything below that is the engine.

  **Three things each framework had to answer for itself.** None of them has `useDeferredValue`, and the table depends on the split it provides: the search string and the filter conditions update urgently so a controlled input never lags a keystroke, while the row-model pass they drive reads a deferred copy. All three landed on the same answer — an idle callback with a deadline — deliberately, because three designs for one problem in one design system would be a defect in itself. The roving cursor and the inline-edit focus hand-off port directly; their effect keying does not, and each is written against its own scheduler.

  **Angular's are structural.** Every part is an attribute directive, because HTML's table content model parses an unknown element _out_ of a `<table>` and hoists it before it — a `<uio-table-row>` between `<tbody>` and `<tr>` silently loses every row. That is also what keeps the DOM identical to React's, since a directive adds no node; parts that render nothing in some state remove and restore their own host element. Angular has no prop spread, so core's eleven prop builders are applied by a directive that diffs the previous bag against the next one; and its toolbar is one part rather than six, because six components would be six nodes the other three libraries do not render. That last one is a real difference in what a consumer can compose, and it is written down in the package README rather than glossed.

  **A bug in the shipped React table, found by bringing the others up beside it.** A page-size picker offering 10 / 25 / 50 / 100 has no correct rendering for a `pageSize` of 3, and each framework picked a different wrong answer: a native `<select>` falls back to its first option, so React's showed "10" while the table paged by 3. The fix is in the engine — `pageSizeOptions(offered, current)` folds the size in effect into the offered list, so the control can always show the truth — and all four adapters use it. `pageSize` comes from `defaultPageSize`, a controlled `pagination` state or a restored URL, none of which is obliged to be one of the four offered.

  **ARIA booleans are enumerated, not present.** `aria-selected="true"` and `aria-selected="false"` are two different answers and `aria-selected=""` is neither; the Angular adapter briefly wrote all three as presence, the way a `data-` state flag is written, which reads a selected row to a screen reader as unselected. Fixed, and the distinction is now explicit in the one place that applies attributes.

  Each package ships its own consumer smoke gate — `examples/<framework>-table-smoke`, built for real and its rendered output asserted — because the failures that matter here are consequences of bundling. A wrong `exports` or `sideEffects` entry lets a bundler drop half the table while the build stays green, and `@ui-organized/<framework>-table/styles` resolves to a file that physically lives in `table-core`'s dist, which is exactly the kind of indirection that silently resolves to an empty file. An unstyled table renders, passes every assertion about its markup, and is unusable.

### Patch Changes

- Updated dependencies [e6613d2]
- Updated dependencies [4bfb23a]
- Updated dependencies
- Updated dependencies [83201b5]
- Updated dependencies [978fa2f]
- Updated dependencies [c5c2036]
- Updated dependencies [93991ae]
- Updated dependencies
- Updated dependencies
- Updated dependencies [6eb40a7]
- Updated dependencies
- Updated dependencies [83201b5]
- Updated dependencies [2a6ea22]
- Updated dependencies [64db6a0]
- Updated dependencies [63cc837]
  - @ui-organized/utils@4.0.0
  - @ui-organized/react@6.0.0
  - @ui-organized/table-core@6.0.0
