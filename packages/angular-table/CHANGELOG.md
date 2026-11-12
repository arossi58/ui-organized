# @ui-organized/angular-table

## 6.1.0

### Minor Changes

- `UioDataTable` now renders the row detail panel. The `detail` input was accepted before, and rows turned clickable when it was set, but nothing showed the panel they opened. It is the same panel React, Vue and Svelte render: the row's title and description, a pager with its position ("2 of 8"), your `render` and `footer`, and a "Discard unsaved changes?" check when the row has edits. Focus returns to the row when it closes. It is also exported as `UioTableDetailSheet` (`<div uioTableDetailSheet>`) for tables composed from parts.

  Confirming a destructive bulk action now runs it. Before, the confirmation closed and the action never ran.

### Patch Changes

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
- Updated dependencies [d35f142]
- Updated dependencies [c5c2036]
- Updated dependencies [93991ae]
- Updated dependencies
- Updated dependencies
- Updated dependencies [83201b5]
- Updated dependencies [2a6ea22]
- Updated dependencies [64db6a0]
- Updated dependencies [63cc837]
  - @ui-organized/utils@4.0.0
  - @ui-organized/angular@6.0.0
  - @ui-organized/table-core@6.0.0
