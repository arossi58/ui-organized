# @ui-organized/svelte-table

> **Not published yet.** Marked `private` until §H's checklist — a changeset, a
> smoke app, and a line in the root `smoke` script. The code is complete and at
> parity with React; the packaging is not done.

The Svelte data table for the ui-organized design system, built on
[`@ui-organized/table-core`](../table-core) — the same framework-free engine the
React, Vue and Angular tables use. Same class names, same stylesheet, same token contract,
no fork of the logic.

## Three layers

| Layer        | What it is                                                   |
| ------------ | ------------------------------------------------------------ |
| 1 — headless | `createDataTable(() => options)`                             |
| 2 — parts    | `TableHeader`, `TableRow`, `TableToolbar`, `TableFilters`, … |
| 3 — wrapper  | `<DataTable>` — the whole table from a props object          |

## Using it

```svelte
<script lang="ts">
  import { DataTable, type TableColumn } from "@ui-organized/svelte-table";
  import "@ui-organized/svelte-table/styles";

  interface Member { id: string; name: string; role: string }
  let { members }: { members: Member[] } = $props();

  const columns: TableColumn<Member>[] = [
    { accessorKey: "name", header: "Name", meta: { primary: true, filter: true } },
    { accessorKey: "role", header: "Role", meta: { filter: { type: "enum" } } },
  ];
</script>

<DataTable
  data={members}
  {columns}
  label="Members"
  getRowId={(row) => row.id}
  selection="multiple"
/>
```

`createDataTable` takes its options as a **getter** — `createDataTable(() => props)`
— so every option is read inside a `$derived` and a reactive source keeps the
table in step.

Everything it returns is a getter over a rune, so a component writes `table.rows`
and the read is tracked. No `.value`, no wrapper type: the same property access
React has, with Svelte's reactivity behind it.

## What is Svelte's rather than React's

**`createDeferred`** stands in for React's `useDeferredValue`. The table splits
every expensive filter in two: the search string and the condition list update
urgently, so an input never lags a keystroke, while the row-model pass they drive
reads a deferred copy. Without the split, typing "ada" lands as "a". It is a
deliberate transcription of `@ui-organized/vue-table`'s answer rather than a
second design — two answers to one problem in one design system would be a defect
in itself.

**`trackStore`** binds core's framework-free stores with `$state` plus the
store's own subscription, which is exactly what `table-core`'s `state.ts`
predicted when it chose that store shape.

## One workaround, and why

`autoResetPageIndex` is turned off and replaced with an explicit effect. See the
comment in `core/createDataTable.svelte.ts`: `@tanstack/svelte-table@9.2.4` backs
its options store with `$state`, which deep-proxies, so `table.options.data` comes
back as a fresh proxy of the same array on every sync. The core row model
memoizes on that identity, rebuilds every time, and resets the page — which made
paging do nothing at all. Vue's adapter uses `shallowRef` and does not proxy, so
neither Vue nor React sees it. Remove both halves when the adapter stops
proxying.

## Scope

**Not in v1:** grouping and aggregation, expandable sub-rows, URL or
localStorage state persistence. Everything else the table does is listed under
[`@ui-organized/table-core`'s scope](../table-core#scope) — the behaviour lives
in the engine, so it is identical across all four adapters.

## Peer dependencies

`svelte >= 5.20`, `@ui-organized/svelte >= 0.1.0`.

## License

Apache-2.0
