<!--
  Pointer drag and keyboard, on one control.

  The drag is TanStack's own handler; the keyboard is core's `resizeKeyDown`, so
  the two cannot drift. It is a `role="separator"` with `aria-valuenow`, which is
  what makes the column width something a screen reader can report rather than
  something only a mouse can discover.
-->
<script setup lang="ts" generic="T extends RowData">
import { computed } from "vue";
import {
  getResizeHandleProps,
  resizeKeyDown,
  type RowData,
  type TableHeaderInstance,
} from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { vueProps } from "../../core/props.js";

const props = defineProps<{ header: TableHeaderInstance<T> }>();
const table = useTableContext<T>();

const column = computed(() => props.header.column);
const bounds = computed(() => {
  const width = column.value.getSize();
  return {
    width,
    min: column.value.columnDef.minSize ?? 0,
    max: column.value.columnDef.maxSize ?? width,
  };
});

const handleProps = computed(() => {
  const headerDef = column.value.columnDef.header;
  return getResizeHandleProps({
    columnId: column.value.id,
    columnLabel: typeof headerDef === "string" ? headerDef : column.value.id,
    width: bounds.value.width,
    min: bounds.value.min,
    max: bounds.value.max,
    active: column.value.getIsResizing(),
  });
});

/** Stops the header's sort button from firing on the same press. */
function startResize(event: MouseEvent | TouchEvent) {
  event.stopPropagation();
  props.header.getResizeHandler()(event);
}

function onKeyDown(event: KeyboardEvent) {
  const action = resizeKeyDown(bounds.value, {
    key: event.key,
    shift: event.shiftKey,
    ctrl: event.ctrlKey,
    meta: event.metaKey,
  });
  if (action.type === "none") return;
  event.preventDefault();
  event.stopPropagation();
  if (action.type === "reset") {
    table.table.setColumnSizing((old: Record<string, number>) => {
      const next = { ...old };
      delete next[column.value.id];
      return next;
    });
    return;
  }
  table.table.setColumnSizing((old: Record<string, number>) => ({
    ...old,
    [column.value.id]: action.width,
  }));
}
</script>

<template>
  <button
    type="button"
    v-bind="vueProps(handleProps)"
    @mousedown="startResize"
    @touchstart="startResize"
    @click.stop
    @keydown="onKeyDown"
  />
</template>
