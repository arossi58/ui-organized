<!--
  One condition, as a segmented chip (Figma 2462:2636): "Name | is greater than
  | 30". Each segment opens the control for the one parameter it shows — the
  field menu, the operator menu, the value editor — so changing a filter is one
  click on the part you mean rather than a trip through a form.

  Removal lives in the field menu and at the foot of the value editor, not in a
  dismiss button: a fourth 24px target in a row of segments is a coin-flip on
  touch, and an operator that takes no value ("is empty") has no value editor to
  put it in.
-->
<script setup lang="ts">
import { computed, ref, watch, watchPostEffect } from "vue";
import { clsx } from "clsx";
import {
  Chip,
  ChipSegment,
  Menu,
  MenuContent,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-organized/vue";
import { afterRowEntrance, type TableFilterCondition } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { focusAfterRemoval, useAutoFocusField } from "./useAutoFocusField.js";
import TableFilterEditor from "./TableFilterEditor.vue";
import { internalGlyph as glyph } from "@ui-organized/vue";

const props = defineProps<{ condition: TableFilterCondition; class?: string }>();
const table = useTableContext();

// Which chip's editor is open is filter state, not chip state: the chip that
// opens is often the one the *header* just created, and removing an open
// condition has to close its editor rather than leave a dangling id behind.
const editing = computed(() => table.filters.editing.value === props.condition.id);
const setOpen = (next: boolean) => table.filters.setEditing(next ? props.condition.id : null);
// The first chip arrives inside a row that is still animating open, so the
// editor waits for the row to settle rather than open against a moving anchor
// and jump. An existing chip settles at once. A post effect, so the first run
// happens after the chip is in the DOM.
const settled = ref(false);
watchPostEffect((onCleanup) => {
  if (!editing.value) {
    settled.value = false;
    return;
  }
  const chip = document.querySelector(`[data-filter-id="${CSS.escape(props.condition.id)}"]`);
  onCleanup(
    afterRowEntrance(chip, () => {
      settled.value = true;
    }),
  );
});
const open = computed(() => editing.value && settled.value);
// The two menus are this chip's alone, so they are local.
const menu = ref<"field" | "operator" | null>(null);
const setMenu = (name: "field" | "operator", next: boolean) => {
  menu.value = next ? name : null;
};

// The condition as it was when the editor opened, so Escape can revert it.
const snapshot = ref<TableFilterCondition | null>(null);
const editorEl = ref<HTMLElement | null>(null);
useAutoFocusField(editorEl, open);

watch(open, (isOpen) => {
  // Only when the editor opens — capturing on every change would defeat it.
  if (isOpen) snapshot.value = props.condition;
});

const description = computed(() => table.filters.describe(props.condition));
const takesValue = computed(() => table.filters.arityOf(props.condition) !== "none");
const operators = computed(() => table.filters.operatorsFor(props.condition));

const remove = () => {
  table.filters.remove(props.condition.id);
  focusAfterRemoval(props.condition.id);
};

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key !== "Escape" || !snapshot.value) return;
  // Ark closes on Escape anyway; this puts the value back first, so Escape
  // abandons the edit rather than committing it.
  table.filters.restore(snapshot.value);
};
</script>

<template>
  <!--
    The group's name is the whole sentence, so a screen reader moving into any
    one segment hears what the filter *is* before what the button does.
  -->
  <Chip
    :class="clsx('data-table__filter-chip', $props.class)"
    :aria-label="`Filter: ${description.text}`"
    :selected="editing || menu !== null"
    :incomplete="!description.complete"
    :data-column-id="condition.columnId"
    :data-filter-id="condition.id"
  >
    <Menu :open="menu === 'field'" @update:open="(next: boolean) => setMenu('field', next)">
      <MenuTrigger as-child>
        <ChipSegment part="label">{{ description.field }}</ChipSegment>
      </MenuTrigger>
      <MenuContent class="data-table__filter-picker">
        <MenuRadioGroup
          :model-value="condition.columnId"
          @update:model-value="(columnId: string) => table.filters.changeField(condition.id, columnId)"
        >
          <MenuRadioItem
            v-for="field in table.filters.fields.value"
            :key="field.columnId"
            :value="field.columnId"
          >
            {{ field.label }}
          </MenuRadioItem>
        </MenuRadioGroup>
        <MenuSeparator />
        <MenuItem value="remove" :icon="glyph('trash')" @select="remove">Remove filter</MenuItem>
      </MenuContent>
    </Menu>

    <Menu :open="menu === 'operator'" @update:open="(next: boolean) => setMenu('operator', next)">
      <MenuTrigger as-child>
        <ChipSegment part="operator">{{ description.relative }}</ChipSegment>
      </MenuTrigger>
      <MenuContent class="data-table__filter-picker">
        <MenuRadioGroup
          :model-value="condition.operator"
          @update:model-value="(operator: string) => table.filters.update(condition.id, { operator })"
        >
          <MenuRadioItem v-for="operator in operators" :key="operator.id" :value="operator.id">
            {{ operator.label }}
          </MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>

    <Popover v-if="takesValue" :open="open" @update:open="setOpen">
      <PopoverTrigger as-child>
        <ChipSegment part="value">{{ description.value }}</ChipSegment>
      </PopoverTrigger>
      <PopoverContent
        class="data-table__filter-editor-popup"
        side="bottom"
        align="start"
        @keydown="onKeyDown"
      >
        <div ref="editorEl" class="data-table__filter-editor">
          <PopoverTitle class="data-table__filter-editor-title">
            {{ description.field }} {{ description.relative }}
          </PopoverTitle>
          <TableFilterEditor :condition="condition" :portal-container="editorEl" />
        </div>
      </PopoverContent>
    </Popover>
  </Chip>
</template>
