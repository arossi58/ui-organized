<!--
  Card mode: one card per row, below the breakpoint.

  The table is *replaced*, not hidden — rendering both trees and hiding one with
  a container query would double the DOM and defeat virtualization on exactly the
  devices that can least afford it. Selection, row actions and the detail sheet
  all keep working, because they are table state rather than table markup.
-->
<script setup lang="ts">
import { computed } from "vue";
import { clsx } from "clsx";
import { cardFieldOrder } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { TableEmpty } from "../TableStates/index.js";
import TableCard from "./TableCard.vue";

defineProps<{ class?: string }>();
const table = useTableContext();

const fields = computed(() => cardFieldOrder(table.options.columns));
const renderRows = computed(() => table.renderRows.value);
const spacers = computed(() =>
  table.virtual.enabled.value ? table.virtual.spacers.value : { top: 0, bottom: 0 },
);
const cap = computed(() => table.options.maxHeight);
const style = computed(() =>
  cap.value === undefined
    ? undefined
    : {
        "--data-table-max-height": typeof cap.value === "number" ? `${cap.value}px` : cap.value,
      },
);
</script>

<template>
  <div v-if="renderRows.length === 0" :class="clsx('data-table__cards', $props.class)">
    <table class="data-table__table">
      <caption class="data-table__sr-only">
        {{
          table.label.value
        }}
      </caption>
      <tbody>
        <TableEmpty />
      </tbody>
    </table>
  </div>
  <ul
    v-else
    :ref="(el) => (table.viewportRef.value = el as HTMLElement | null)"
    :class="clsx('data-table__cards', $props.class)"
    :aria-label="table.label.value"
    :style="style"
  >
    <li
      v-if="spacers.top > 0"
      class="data-table__card-spacer"
      aria-hidden="true"
      :style="{ height: `${spacers.top}px` }"
    />
    <TableCard
      v-for="entry in renderRows"
      :key="entry.row.id"
      :row="entry.row"
      :index="entry.index"
      :fields="fields"
    />
    <li
      v-if="spacers.bottom > 0"
      class="data-table__card-spacer"
      aria-hidden="true"
      :style="{ height: `${spacers.bottom}px` }"
    />
  </ul>
</template>
