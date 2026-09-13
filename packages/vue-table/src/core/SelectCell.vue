<!--
  A row's selection checkbox, with shift-click range selection.

  Given a `Checkbox` with a closed prop API — no ref, no `onClick`, no `data-*`
  passthrough — the wrapper records `shiftKey` from the pointer or keyboard event
  that *precedes* the change, which the change handler then reads. It needs no
  change to `@ui-organized/vue`, which is the point: widening a component's API
  to serve one consumer is how a design system's props turn into a junk drawer.
-->
<script setup lang="ts">
import { Checkbox } from "@ui-organized/vue";
import { useTableContext } from "./tableContext.js";

const props = defineProps<{ rowId: string; rowLabel: string }>();
const table = useTableContext();

let shift = false;
const remember = (event: MouseEvent | KeyboardEvent) => {
  shift = event.shiftKey;
};
const change = (checked: boolean) => {
  table.selection.toggle(props.rowId, checked, shift);
  shift = false;
};
</script>

<template>
  <span class="data-table__select-hit" @mousedown.capture="remember" @keydown.capture="remember">
    <Checkbox
      :checked="table.selection.isSelected(rowId)"
      :aria-label="rowLabel"
      @update:checked="change"
    />
  </span>
</template>
