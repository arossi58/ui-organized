<!--
  Left and right, for a table wider than its viewport.

  The scrollbar is the primary affordance; this is the *visible* one. A mouse
  with no horizontal wheel, a thin overlay scrollbar that only paints while it is
  moving, and a pinned first column that makes a half-cut column at the edge look
  deliberate all leave "there are more columns over there" as something the user
  has to guess at.

  Absent rather than disabled when everything fits: a pair of permanently dead
  buttons in every toolbar is worse noise than no buttons at all. At the ends of
  the scroll they *are* disabled — the same call `Pagination` makes for its own
  prev/next, so the two read the same way.
-->
<script setup lang="ts">
import { computed } from "vue";
import { clsx } from "clsx";
import { Button } from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";

withDefaults(defineProps<{ leftLabel?: string; rightLabel?: string; class?: string }>(), {
  leftLabel: "Scroll left",
  rightLabel: "Scroll right",
});
const table = useTableContext();
const scroll = computed(() => table.scroll.state.value);
</script>

<template>
  <!--
    Grouped, and tighter than the toolbar's own gap: two halves of one control
    rather than two more buttons in the row.
  -->
  <div v-if="scroll.overflowing" :class="clsx('data-table__scroll-buttons', $props.class)">
    <Button
      intent="secondary"
      :size="table.size.value"
      icon="chevron-left"
      :aria-label="leftLabel"
      :disabled="!scroll.canScrollLeft"
      @click="table.scroll.by(-1)"
    />
    <Button
      intent="secondary"
      :size="table.size.value"
      icon="chevron-right"
      :aria-label="rightLabel"
      :disabled="!scroll.canScrollRight"
      @click="table.scroll.by(1)"
    />
  </div>
</template>
