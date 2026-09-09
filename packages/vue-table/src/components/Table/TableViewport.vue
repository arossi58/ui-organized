<!--
  The scroll container and the `<table>` element, which are inseparable: a
  viewport with two tables in it means nothing, and `<caption>` and `<colgroup>`
  have to be emitted between them.
-->
<script setup lang="ts">
import { computed } from "vue";
import { clsx } from "clsx";
import {
  getCaptionProps,
  getColProps,
  getTableProps,
  getViewportProps,
} from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { vueProps } from "../../core/props.js";

const props = defineProps<{ class?: string; maxHeight?: number | string }>();
const table = useTableContext();

const viewport = computed(() => getViewportProps(table.chrome.value));
const tableProps = computed(() => getTableProps(table.chrome.value));
const caption = computed(() => getCaptionProps(table.captionVisible.value));
const columns = computed(() => table.table.getVisibleLeafColumns());

const lengthOf = (value: number | string) => (typeof value === "number" ? `${value}px` : value);
const cap = computed(() => props.maxHeight ?? table.options.maxHeight);
const style = computed(() =>
  cap.value === undefined ? undefined : { "--data-table-max-height": lengthOf(cap.value) },
);
</script>

<template>
  <div
    :ref="(el) => (table.viewportRef.value = el as HTMLElement | null)"
    v-bind="vueProps(viewport)"
    :class="clsx(viewport.className, $props.class)"
    :style="style"
  >
    <!--
      One key handler for the whole grid rather than one per cell: the cursor is
      table state, so the key only has to reach the table. It sits on the element
      that carries `role="grid"`, not on the scroll container — which is also
      what stops it being a keyboard handler on a div with no role at all.
    -->
    <table
      v-bind="vueProps(tableProps)"
      @keydown="table.interactive.value ? table.onGridKeyDown($event) : undefined"
    >
      <!-- First child of <table>, per the content model. -->
      <caption v-bind="vueProps(caption)">
        {{
          table.label.value
        }}
      </caption>
      <colgroup>
        <col
          v-for="column in columns"
          :key="column.id"
          v-bind="vueProps(getColProps(table.columnWidths.value[column.id]))"
        />
      </colgroup>
      <slot />
    </table>
  </div>
</template>
