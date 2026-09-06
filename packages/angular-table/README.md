# @ui-organized/angular-table

> **Not published yet.** Marked `private` until §H's checklist — a changeset, a
> smoke app, and a line in the root `smoke` script.

The Angular data table for the ui-organized design system, built on
[`@ui-organized/table-core`](../table-core) — the same framework-free engine the
React, Vue and Svelte tables use. Same class names, same stylesheet, same token
contract, no fork of the logic.

## Three layers

| Layer        | What it is                                                           |
| ------------ | -------------------------------------------------------------------- |
| 1 — headless | `createDataTable(options)` — signals, called in an injection context |
| 2 — parts    | `UioTableHeader`, `UioTableRow`, `UioTableToolbar`, …                |
| 3 — wrapper  | `<div uioDataTable>` — the whole table from its inputs               |

## Using it

```ts
import { Component, signal } from "@angular/core";
import { UioDataTable, type TableColumn } from "@ui-organized/angular-table";
import "@ui-organized/angular-table/styles";

interface Member {
  id: string;
  name: string;
  role: string;
}

const COLUMNS: TableColumn<Member>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true, filter: true } },
  { accessorKey: "role", header: "Role", meta: { filter: { type: "enum" } } },
];

@Component({
  selector: "app-members",
  standalone: true,
  imports: [UioDataTable],
  template: `
    <div
      uioDataTable
      [data]="members()"
      [columns]="columns"
      label="Members"
      [getRowId]="rowId"
      selection="multiple"
    ></div>
  `,
})
export class MembersPage {
  protected readonly members = signal<Member[]>([]);
  protected readonly columns = COLUMNS;
  protected readonly rowId = (row: Member) => row.id;
}
```

## Everything is an attribute directive

Every part selects on a real element — `div[uioTable]`, `thead[uioTableHeader]`,
`tbody[uioTableBody]`, `tr[uioTableRow]` — and none of them is a custom element.

That is not a style preference. HTML's table content model rejects unknown
elements inside `<table>`: a `<uio-table-row>` between `<tbody>` and `<tr>` is
parsed _out_ of the table and hoisted before it, so the table silently loses its
rows. An attribute directive adds no node at all, which is also what keeps this
package's DOM identical to React's under the parity gate.

The same constraint is why the six toolbar controls are inlined into
`UioTableToolbar` rather than exported separately, and why parts that render
nothing in some states — the selection bar, the empty toolbar — use
`HostPresence` from `@ui-organized/angular` to take their own host element out
of the DOM. A React component returns `null`; an Angular host element cannot.
The cost is that a consumer cannot reorder the toolbar's six controls, which the
other three frameworks allow. Recorded rather than hidden.

## What is Angular's rather than React's

Four things in the port are written rather than translated, all in `src/lib/core`:

**`element-props.ts`** stands in for JSX's prop spread, which Angular has no
equivalent of. Core's eleven prop builders return a bag whose _shape_ changes
between renders, not just its values, so `applyElementProps` diffs the previous
bag against the next one and removes what is gone. Numeric styles get `px`
appended, as React does — without it `width: 180` is not a length and every sized
column falls back to auto.

**`create-deferred.ts`** stands in for `useDeferredValue`. The search string and
the condition list update urgently so an input never lags a keystroke, while the
row-model pass they drive reads a deferred copy. Its initial value is resolved
lazily through `untracked`, because a required input has no value yet when the
factory runs.

**`create-data-table.ts`** seeds its four controlled states with `linkedSignal`
rather than `signal`, for the same reason: the factory is constructed before
Angular has set the required inputs, and reading one there is NG0950.

**`table-props-host.ts`** exists because a component cannot bind a host directive's
input to itself. Parts that need their own prop bag applied extend it instead.

## Peer dependencies

`@angular/core >= 21`, `@angular/common >= 21`, `@angular/cdk >= 21`,
`@ui-organized/angular >= 0.1.0`.

## License

Apache-2.0
