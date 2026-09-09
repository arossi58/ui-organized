<!--
  Sorting, from the header rather than from a column.

  The column headers already sort, so in table mode this is a convenience. In
  **card mode it is the only sort control there is** — there are no headers to
  click — and a table that silently loses the ability to sort at 640px is a table
  that is broken on phones.

  One column at a time. Multi-column sort stays where it is discoverable and
  cheap: shift-clicking headers.
-->
<script setup lang="ts">
import { computed } from "vue";
import {
  Button,
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";

const props = withDefaults(defineProps<{ label?: string; class?: string }>(), { label: "Sort" });
const table = useTableContext();

const columns = computed(() => table.table.getAllLeafColumns().filter((c) => c.getCanSort()));
const active = computed(() => table.state.value.sorting?.[0]);
const activeId = computed(() => active.value?.id ?? "");
const direction = computed(() => (active.value?.desc ? "desc" : "asc"));
const triggerIcon = computed(() =>
  activeId.value ? (active.value?.desc ? "sort-desc" : "sort-asc") : "sort",
);

const headerOf = (column: (typeof columns.value)[number]) =>
  typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;

const chooseColumn = (id: string) =>
  table.table.setSorting(id ? [{ id, desc: direction.value === "desc" }] : []);
const chooseDirection = (next: string) => {
  if (activeId.value) table.table.setSorting([{ id: activeId.value, desc: next === "desc" }]);
};
</script>

<template>
  <Menu v-if="columns.length > 0">
    <MenuTrigger as-child>
      <Button
        intent="secondary"
        :size="table.size.value"
        :icon="triggerIcon"
        :aria-label="props.label"
        :class="$props.class"
      />
    </MenuTrigger>
    <MenuContent align="end" class="data-table__sort-menu">
      <MenuGroup>
        <MenuGroupLabel>Sort by</MenuGroupLabel>
        <MenuRadioGroup :model-value="activeId" @update:model-value="chooseColumn">
          <MenuRadioItem v-for="column in columns" :key="column.id" :value="column.id">
            {{ headerOf(column) }}
          </MenuRadioItem>
        </MenuRadioGroup>
      </MenuGroup>

      <MenuSeparator />

      <MenuGroup>
        <MenuGroupLabel>Direction</MenuGroupLabel>
        <MenuRadioGroup :model-value="direction" @update:model-value="chooseDirection">
          <!--
            Disabled rather than hidden: the choice is always part of the menu's
            shape, and a menu that changes length as you use it is harder to aim
            at the second time.
          -->
          <MenuRadioItem value="asc" :disabled="!activeId">Ascending</MenuRadioItem>
          <MenuRadioItem value="desc" :disabled="!activeId">Descending</MenuRadioItem>
        </MenuRadioGroup>
      </MenuGroup>

      <template v-if="activeId">
        <MenuSeparator />
        <MenuItem value="clear-sorting" @select="table.table.setSorting([])">
          Clear sorting
        </MenuItem>
      </template>
    </MenuContent>
  </Menu>
</template>
