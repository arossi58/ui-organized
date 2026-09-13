<!--
  Per-row actions, as a menu rather than a row of buttons.

  A menu is one tab stop per row instead of three, which matters a great deal
  when there are two hundred rows — and it is the only affordance that survives
  card mode unchanged.
-->
<script setup lang="ts" generic="T extends RowData">
import { computed } from "vue";
import { Button, Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-organized/vue";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { RowData } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import type { RowAction } from "../../core/types.js";

const props = withDefaults(
  defineProps<{
    /** The row the actions operate on. */
    row: T;
    /**
     * Overrides the table's own `rowActions`. Only needed when the part is used
     * outside a `<DataTable>`.
     */
    actions?: RowAction<T>[];
    /** Accessible name for the trigger. Defaults to "Row actions". */
    label?: string;
  }>(),
  { label: "Row actions" },
);

const table = useTableContext<T>();
const items = computed(() => props.actions ?? table.options.rowActions ?? []);
</script>

<template>
  <Menu v-if="items.length > 0">
    <MenuTrigger as-child>
      <Button intent="ghost" :size="table.size.value" icon="menu" :aria-label="label" />
    </MenuTrigger>
    <MenuContent align="end">
      <MenuItem
        v-for="action in items"
        :key="action.id"
        :value="action.id"
        :icon="action.icon as CanonicalIconName | undefined"
        :destructive="action.destructive"
        :disabled="action.disabled?.(row)"
        @select="action.onRun(row)"
      >
        {{ action.label }}
      </MenuItem>
    </MenuContent>
  </Menu>
</template>
