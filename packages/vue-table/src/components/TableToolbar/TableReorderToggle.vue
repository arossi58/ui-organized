<!--
  Enters and leaves reorder mode, for `reorderable: "toggle"`. Absent for any
  other setting, and in card mode, which has no headers to move.

  The label says what a press does next — "Reorder", then "Done" — rather than
  carrying a pressed state, so the button reads the same to a screen reader as
  it does on screen, and "Done" is the obvious way out.
-->
<script setup lang="ts">
import { Button } from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";

defineProps<{ class?: string }>();
const table = useTableContext();
</script>

<template>
  <Button
    v-if="table.reorder.mode.value === 'toggle' && table.mode.value !== 'cards'"
    :intent="table.reorder.active.value ? 'primary' : 'secondary'"
    :size="table.size.value"
    :class="$props.class"
    :aria-label="table.reorder.active.value ? 'Done reordering columns' : 'Reorder columns'"
    @click="table.reorder.setActive(!table.reorder.active.value)"
  >
    {{ table.reorder.active.value ? "Done" : "Reorder" }}
  </Button>
</template>
