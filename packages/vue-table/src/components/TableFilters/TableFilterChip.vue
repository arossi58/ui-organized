<!--
  One condition, as a chip that opens its own editor (Figma 2298:376).

  No dismiss button on the chip itself: removal lives inside the editor, where
  the design puts it. That keeps the chip a single target the whole width of the
  words it shows — a 20px-tall pill with a second 20px hit area inside it is a
  coin-flip on touch.
-->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { clsx } from "clsx";
import { Chip, Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@ui-organized/vue";
import type { ComparisonIconName } from "@ui-organized/vue";
import type { TableFilterCondition } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { useAutoFocusField } from "./useAutoFocusField.js";
import TableFilterEditor from "./TableFilterEditor.vue";

const props = defineProps<{ condition: TableFilterCondition; class?: string }>();
const table = useTableContext();

// Which chip is open is filter state, not chip state: the chip that opens is
// often the one the *header* just created, and removing an open condition has to
// close its editor rather than leave a dangling id behind.
const open = computed(() => table.filters.editing.value === props.condition.id);
const setOpen = (next: boolean) => table.filters.setEditing(next ? props.condition.id : null);

// The condition as it was when the editor opened, so Escape can revert it.
const snapshot = ref<TableFilterCondition | null>(null);
const editorEl = ref<HTMLElement | null>(null);
useAutoFocusField(editorEl, open);

watch(open, (isOpen) => {
  // Only when the editor opens — capturing on every change would defeat it.
  if (isOpen) snapshot.value = props.condition;
});

const description = computed(() => table.filters.describe(props.condition));

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key !== "Escape" || !snapshot.value) return;
  // Ark closes on Escape anyway; this puts the value back first, so Escape
  // abandons the edit rather than committing it.
  table.filters.restore(snapshot.value);
};
</script>

<template>
  <Popover :open="open" @update:open="setOpen">
    <!--
      The design system `Chip`. Every attribute but `class` lands on its body, so
      the trigger's `id`, click handler and `aria-expanded` attach to the button
      that opens the popover rather than to a wrapper.

      Left at its default size, whatever the table's density: `md` is the size
      Figma draws a filter chip at, and these describe the table rather than
      being part of it — a row of 40px chips would outweigh the header above.
    -->
    <PopoverTrigger as-child>
      <Chip
        :class="clsx('data-table__filter-chip', $props.class)"
        :label="description.field"
        :operator="description.icon as ComparisonIconName | undefined"
        :operator-label="description.relative"
        :detail="description.relative"
        :selected="open"
        :incomplete="!description.complete"
        :data-column-id="condition.columnId"
        :data-filter-id="condition.id"
      >
        {{ description.value }}
      </Chip>
    </PopoverTrigger>
    <PopoverContent
      class="data-table__filter-editor-popup"
      side="bottom"
      align="start"
      @keydown="onKeyDown"
    >
      <div ref="editorEl" class="data-table__filter-editor">
        <PopoverTitle class="data-table__filter-editor-title">
          {{ description.field }}
        </PopoverTitle>
        <TableFilterEditor :condition="condition" :portal-container="editorEl" />
      </div>
    </PopoverContent>
  </Popover>
</template>
