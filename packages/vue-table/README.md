# @ui-organized/vue-table

> **Not published yet.** Marked `private` until §H's checklist — a changeset, a
> smoke app, and a line in the root `smoke` script. The code is complete and at
> parity with React; the packaging is not done.

The Vue data table for the ui-organized design system, built on
[`@ui-organized/table-core`](../table-core) — the same framework-free engine the
React, Svelte and Angular tables use. Same class names, same stylesheet, same token contract, no fork
of the logic.

## Three layers

| Layer        | What it is                                                   |
| ------------ | ------------------------------------------------------------ |
| 1 — headless | `useDataTable(options)` — the composable                     |
| 2 — parts    | `TableHeader`, `TableRow`, `TableToolbar`, `TableFilters`, … |
| 3 — wrapper  | `<DataTable>` — the whole table from a props object          |

## The composable

```vue
<script setup lang="ts">
import { useDataTable, provideTable, type TableColumn } from "@ui-organized/vue-table";
import "@ui-organized/vue-table/styles";

interface Member {
  id: string;
  name: string;
  role: string;
}

const props = defineProps<{ members: Member[] }>();

const columns: TableColumn<Member>[] = [
  { accessorKey: "name", header: "Name", meta: { primary: true, filter: true } },
  { accessorKey: "role", header: "Role", meta: { filter: { type: "enum" } } },
];

const table = useDataTable({
  get data() {
    return props.members;
  },
  columns,
  label: "Members",
  getRowId: (row) => row.id,
  selection: "multiple",
});
provideTable(table);
</script>
```

`useDataTable` takes the options object **reactively** — a component's `props` is
one, and that is the intended caller. Every option is read inside a `computed`,
so a reactive source updates the table and a plain object simply never changes.

Everything it returns that is derived is a `ComputedRef`; actions are plain
functions. A composable runs once, so anything that were a bare value would be a
snapshot of the first frame that silently never updates again.

## What is Vue's rather than React's

Two things in the port are written rather than translated, and both are in
`src/core`:

**`useDeferred`** stands in for React's `useDeferredValue`, which Vue has no
equivalent of. The table splits every expensive filter in two: the search string
and the condition list update urgently, so an input never lags a keystroke, while
the row-model pass they drive reads a deferred copy. Without the split, typing
"ada" lands as "a". Vue has no priority scheduler, so the deferral is an idle
callback with a deadline — see the file's header for why idle rather than a
debounce.

**`useStore`** binds core's framework-free stores with `shallowRef` +
`onScopeDispose`, which is exactly what `table-core`'s `state.ts` predicted when
it chose that store shape.

## Peer dependencies

`vue >= 3.5`, `@ui-organized/vue >= 0.1.0`.

## License

Apache-2.0
