<!--
  Card mode's sort control: a labelled button that opens a bottom sheet holding
  every sort control.

  A menu anchored to a 36px icon is a desktop affordance. On a phone the menu
  covers the cards it is sorting; a sheet gives the controls the full width and
  puts them within thumb reach. What is applied is counted on the button.
-->
<script setup lang="ts">
import { computed } from "vue";
import {
  Button,
  RadioGroup,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";
import TableSheetButton from "./TableSheetButton.vue";
import { internalGlyph as glyph } from "@ui-organized/vue";

const props = withDefaults(defineProps<{ label?: string; class?: string }>(), { label: "Sort" });
const table = useTableContext();

const columns = computed(() => table.table.getAllLeafColumns().filter((c) => c.getCanSort()));
const sorting = computed(() => table.state.value.sorting ?? []);
const active = computed(() => sorting.value[0]);
const activeId = computed(() => active.value?.id ?? "");
const direction = computed(() => (active.value?.desc ? "desc" : "asc"));
const icon = computed(() =>
  glyph(activeId.value ? (active.value?.desc ? "sort-desc" : "sort-asc") : "sort"),
);
const options = computed(() =>
  columns.value.map((column) => ({
    value: column.id,
    label: typeof column.columnDef.header === "string" ? column.columnDef.header : column.id,
  })),
);

const chooseColumn = (id: string) =>
  table.table.setSorting([{ id, desc: direction.value === "desc" }]);
const chooseDirection = (next: string) => {
  if (activeId.value) table.table.setSorting([{ id: activeId.value, desc: next === "desc" }]);
};
</script>

<template>
  <Sheet v-if="columns.length > 0">
    <SheetTrigger as-child>
      <TableSheetButton
        :icon="icon"
        :label="props.label"
        :count="sorting.length"
        unit="applied"
        :class="$props.class"
      />
    </SheetTrigger>
    <SheetContent side="bottom" size="lg" class="data-table__sheet">
      <SheetTitle>{{ props.label }}</SheetTitle>
      <div class="data-table__sheet-body">
        <RadioGroup
          label="Sort by"
          :options="options"
          :model-value="activeId"
          @update:model-value="chooseColumn"
        />
        <!--
          Disabled rather than hidden, as in the desktop menu: the sheet keeps its
          shape, so the second visit finds the controls where they were. Nothing
          is checked until there is a sort to have a direction: a pre-ticked
          "Ascending" over nothing reads as a sort that is applied.
        -->
        <RadioGroup
          label="Direction"
          orientation="horizontal"
          :disabled="!activeId"
          :options="[
            { value: 'asc', label: 'Ascending' },
            { value: 'desc', label: 'Descending' },
          ]"
          :model-value="activeId ? direction : ''"
          @update:model-value="chooseDirection"
        />
      </div>
      <SheetFooter>
        <Button
          intent="ghost"
          size="lg"
          :disabled="!activeId"
          @click="table.table.setSorting([])"
        >
          Clear sort
        </Button>
        <SheetClose as-child>
          <Button intent="primary" size="lg">Done</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
