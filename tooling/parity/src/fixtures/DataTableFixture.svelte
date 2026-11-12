<script lang="ts">
  import { DataTable, type TableColumn } from "@ui-organized/svelte-table";
  import {
    MEMBERS,
    MEMBER_DETAIL,
    columnsFor,
    memberRowId,
    type ColumnSet,
    type Member,
  } from "./tableFixture.js";

  /**
   * The same table the React builder composes, from the same data and the same
   * columns — see `./tableFixture.ts` for why the shape is shared and only the
   * switches travel in the case.
   */
  let {
    columnSet,
    rowActions,
    detail,
    noData,
    ...props
  }: {
    columnSet?: ColumnSet;
    rowActions?: boolean;
    detail?: boolean;
    noData?: boolean;
    [key: string]: unknown;
  } = $props();

  const columns = $derived(columnsFor(columnSet) as unknown as TableColumn<Member>[]);
  const data = $derived(noData ? [] : MEMBERS);
  // The functions the case cannot carry, built here — the one place a fixture
  // writes framework-specific code, and exactly what a consumer writes.
  const actions = $derived(
    rowActions
      ? [
          { id: "edit", label: "Edit", onRun: () => {} },
          { id: "remove", label: "Remove", destructive: true, onRun: () => {} },
        ]
      : undefined,
  );
</script>

<DataTable
  {...props}
  {data}
  {columns}
  getRowId={memberRowId}
  label="Members"
  rowActions={actions}
  detail={detail ? MEMBER_DETAIL : undefined}
/>
