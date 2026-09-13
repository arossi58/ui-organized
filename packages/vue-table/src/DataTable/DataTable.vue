<!--
  Layer 3: the whole table from a props object.

  It composes exactly the parts a consumer would compose by hand — which is the
  test of whether layer 2 is real. Anything this does that the parts cannot is a
  gap in the parts, not a feature of the wrapper.
-->
<script setup lang="ts" generic="T extends RowData">
import { computed } from "vue";
import type { RowData } from "@ui-organized/table-core";
import { provideTable } from "../core/tableContext.js";
import { useDataTable } from "../core/useDataTable.js";
import type { UseDataTableOptions } from "../core/types.js";
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableViewport,
} from "../components/Table/index.js";
import { TableCards } from "../components/TableCards/index.js";
import { TableDetailSheet } from "../components/TableDetailSheet/index.js";
import { TablePagination } from "../components/TablePagination/index.js";
import { TableSelectionBar } from "../components/TableSelectionBar/index.js";
import { TableToolbar } from "../components/TableToolbar/index.js";

/**
 * `defineProps` with a generic, then handed to the composable **as the props
 * object itself** rather than spread into a new one.
 *
 * Spreading would take a snapshot: `props` is reactive, a plain copy is not, and
 * the table would stop following its own inputs the moment it was built. This is
 * the same trap `useDataTable`'s header describes, one level up.
 *
 * ── Every optional boolean defaults to `undefined`, and it is load-bearing ──
 *
 * Vue casts an **absent** Boolean prop to `false`. Without the list below, a
 * `<DataTable>` written with no `sortable` arrives with `sortable: false` — a
 * deliberate-looking refusal rather than an absence — and every `?? true` in the
 * composable is dead. The symptom is a table that renders correctly and silently
 * has no toolbar, no sorting, no search and no filters, which is exactly what
 * the first parity run against React showed.
 *
 * `virtual` is in the list too: it is `boolean | VirtualConfig`, and a union with
 * Boolean in it gets the same cast.
 *
 * The same rule, and the same reason, as `@ui-organized/vue`'s `props.ts`.
 */
const props = withDefaults(defineProps<UseDataTableOptions<T> & { class?: string }>(), {
  captionVisible: undefined,
  sortable: undefined,
  filterable: undefined,
  searchable: undefined,
  paginated: undefined,
  resizable: undefined,
  reorderable: undefined,
  hideableColumns: undefined,
  sortMenu: undefined,
  exportable: undefined,
  virtual: undefined,
  loading: undefined,
  manual: undefined,
});

const api = useDataTable<T>(props as UseDataTableOptions<T>);
provideTable(api);

const paginated = computed(() => props.paginated ?? false);
</script>

<template>
  <Table :class="$props.class">
    <TableToolbar />
    <TableSelectionBar />

    <TableCards v-if="api.mode.value === 'cards'" />
    <TableViewport v-else>
      <TableHeader />
      <TableBody />
      <TableFooter />
    </TableViewport>

    <TablePagination v-if="paginated" />
    <TableDetailSheet v-if="props.detail" />
  </Table>
</template>
