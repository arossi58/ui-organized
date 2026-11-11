<script setup lang="ts" generic="T extends RowData">
import { computed } from "vue";
import { FlexRender } from "@tanstack/vue-table";
import {
  alignOf,
  getCellProps,
  metaOf,
  stickyPositionOf,
  type RowData,
  type TableCellInstance,
  type TableEditContext,
  type TableInstance,
  type TableRowModel,
} from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { vueProps } from "../../core/props.js";
import CellEditor from "./CellEditor.vue";

const props = defineProps<{
  cell: TableCellInstance<T>;
  row: TableRowModel<T>;
  index: number;
  rowIndex: number;
  primary: boolean;
  focused: boolean;
  editContext: TableEditContext<T> | null;
}>();

const table = useTableContext<T>();
const column = computed(() => props.cell.column);
const meta = computed(() => metaOf<T>(column.value.columnDef));
const editing = computed(() =>
  props.editContext?.columnId === column.value.id ? props.editContext : null,
);
const interactive = computed(() => table.interactive.value);
const editable = computed(() => Boolean(meta.value?.edit));

const cellProps = computed(() =>
  getCellProps({
    columnId: column.value.id,
    index: props.index,
    align: alignOf(column.value.columnDef),
    primary: props.primary,
    sticky: stickyPositionOf(table.table as unknown as TableInstance<T>, column.value),
    focused: props.focused,
    editable: editable.value,
    editing: Boolean(editing.value),
    invalid: Boolean(editing.value?.invalid),
    interactive: interactive.value,
  }),
);

// The identifying column is a real row header, which is what makes a screen
// reader announce "Ada Lovelace, Role, Engineer" instead of just "Engineer".
const tag = computed(() => (props.primary ? "th" : "td"));

const onFocus = () => {
  if (interactive.value) table.focus.setCursor({ row: props.rowIndex, col: props.index });
};
// One click opens the editor. The click stops here either way: it must not
// also activate the row (open its detail sheet), and a click *inside* the open
// editor must not restart the edit and throw the draft away.
const onClick = (event: MouseEvent) => {
  if (!editable.value) return;
  event.stopPropagation();
  if (!editing.value) table.edit.start(props.row, column.value.id);
};
</script>

<template>
  <component
    :is="tag"
    v-bind="vueProps(cellProps)"
    :data-cell="`${rowIndex}:${index}`"
    @focus="onFocus"
    @click="onClick"
  >
    <CellEditor v-if="editing">
      <component :is="() => meta?.edit?.render(editing!)" />
    </CellEditor>
    <FlexRender v-else :cell="cell" />
  </component>
</template>
