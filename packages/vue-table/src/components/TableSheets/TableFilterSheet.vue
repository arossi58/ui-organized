<!--
  Card mode's filter control: a labelled button that opens a bottom sheet with
  every filterable field at once, one accordion section each, so filtering on a
  phone is "open the field, pick the value" rather than "add a filter, choose
  its field, then pick the value".

  Each section edits a real condition. While the sheet is open every field has
  at least one, so its editor has something to write to: the sheet adds an
  empty draft for any field without one. A draft is an incomplete condition,
  which the filter model keeps but never applies, so drafts change nothing until
  they are given a value; the badge counts only complete conditions; and closing
  the sheet removes the drafts nobody filled in.
-->
<script setup lang="ts">
import { computed, defineComponent, h, markRaw, ref, watch, type Component } from "vue";
import {
  Accordion,
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";
import TableFilterSheetSection from "./TableFilterSheetSection.vue";
import TableSheetButton from "./TableSheetButton.vue";
import { internalGlyph as glyph } from "@ui-organized/vue";

const props = withDefaults(defineProps<{ label?: string; class?: string }>(), {
  label: "Filter",
});
const table = useTableContext();
const open = ref(false);

const fields = computed(() => table.filters.fields.value);
const applied = computed(() =>
  table.filters.conditions.value.filter((condition) => table.filters.describe(condition).complete),
);
const count = computed(() => applied.value.length);

// Re-run on every change while open, not just on opening: "Clear" empties a
// field, and that field then needs a fresh draft to keep its editor.
const missingKey = computed(() =>
  open.value
    ? fields.value
        .filter(
          (field) =>
            !table.filters.conditions.value.some(
              (condition) => condition.columnId === field.columnId,
            ),
        )
        .map((field) => field.columnId)
        .join(",")
    : "",
);
watch(missingKey, (key) => {
  if (!key) return;
  for (const columnId of key.split(",")) table.filters.add(columnId);
  // `filters.add` also marks the condition as being edited, which opens a
  // chip's popover in table mode. There are no chips here; undo it.
  table.filters.setEditing(null);
});

const onOpenChange = (next: boolean) => {
  open.value = next;
  if (!next) {
    for (const condition of table.filters.conditions.value) {
      if (!table.filters.describe(condition).complete) table.filters.remove(condition.id);
    }
  }
};

const clearAll = () => {
  for (const condition of applied.value) table.filters.remove(condition.id);
};

// `Accordion` takes components, not slots. One stable pair per field, cached by
// column id, so a change re-renders the section instead of remounting it.
const sections = new Map<string, { title: Component; content: Component }>();
const sectionFor = (columnId: string) => {
  let section = sections.get(columnId);
  if (!section) {
    const part = (which: "title" | "content") =>
      markRaw(
        defineComponent({
          name: `TableFilterSheetSection-${which}`,
          setup: () => () => h(TableFilterSheetSection, { columnId, part: which }),
        }),
      );
    section = { title: part("title"), content: part("content") };
    sections.set(columnId, section);
  }
  return section;
};
const items = computed(() =>
  fields.value.map((field) => ({ value: field.columnId, ...sectionFor(field.columnId) })),
);
</script>

<template>
  <Sheet v-if="fields.length > 0" :open="open" @update:open="onOpenChange">
    <SheetTrigger as-child>
      <TableSheetButton
        :icon="glyph('filter')"
        :label="props.label"
        :count="count"
        unit="applied"
        :class="$props.class"
      />
    </SheetTrigger>
    <SheetContent side="bottom" size="lg" class="data-table__sheet">
      <SheetTitle>{{ props.label }}</SheetTitle>
      <div class="data-table__sheet-body">
        <!--
          Every section starts collapsed, so the whole list of fields fits on
          screen at once; each header says what it applies, so nothing is
          hidden by being closed. Open one to edit it.
        -->
        <Accordion
          multiple
          class="data-table__sheet-sections"
          :items="items"
        />
      </div>
      <SheetFooter>
        <Button intent="ghost" size="lg" :disabled="count === 0" @click="clearAll">
          Clear all
        </Button>
        <SheetClose as-child>
          <Button intent="primary" size="lg">Done</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
