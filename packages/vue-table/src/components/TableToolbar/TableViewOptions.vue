<!--
  Column visibility, and — when reordering is on — the keyboard-reachable half of
  reordering. A drag-only affordance fails the a11y gate, so the menu is the
  primary control and the drag is the enhancement.
-->
<script setup lang="ts">
import { computed } from "vue";
import {
  Button,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@ui-organized/vue";
import { toggleableColumns } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";

const props = withDefaults(defineProps<{ label?: string; class?: string }>(), { label: "Columns" });
const table = useTableContext();
const columns = computed(() => toggleableColumns(table.table.getAllLeafColumns()));
const headerOf = (column: (typeof columns.value)[number]) =>
  typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;
</script>

<template>
  <Menu v-if="columns.length > 0">
    <MenuTrigger as-child>
      <Button
        intent="secondary"
        :size="table.size.value"
        icon="settings"
        :aria-label="props.label"
      />
    </MenuTrigger>
    <MenuContent align="end" :class="$props.class">
      <MenuGroup>
        <MenuGroupLabel>Visible columns</MenuGroupLabel>
        <MenuCheckboxItem
          v-for="column in columns"
          :key="column.id"
          :value="column.id"
          :checked="column.getIsVisible()"
          @update:checked="(checked: boolean) => column.toggleVisibility(checked)"
        >
          {{ headerOf(column) }}
        </MenuCheckboxItem>
      </MenuGroup>
      <template v-if="table.options.reorderable">
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>Reset</MenuGroupLabel>
          <MenuItem value="reset-order" @select="table.table.resetColumnOrder()">
            Reset column order
          </MenuItem>
          <MenuItem value="reset-sizing" @select="table.table.resetColumnSizing()">
            Reset column widths
          </MenuItem>
        </MenuGroup>
      </template>
    </MenuContent>
  </Menu>
</template>
