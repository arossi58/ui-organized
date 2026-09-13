<!--
  The field picker, in both the shapes the design uses it: the header's icon-only
  button (Figma 2298:336) and the filter bar's "＋ Add" (2298:531).

  A `Menu`, like every other menu the table puts in its chrome
  (`TableViewOptions`, `TableExportMenu`, `TableRowActions`). Picking a field
  *does* something — it adds a filter and opens that filter's editor — so
  `role="menu"` with `menuitem` children is the honest semantic.

  No search box: a text input inside `role="menu"` breaks the menu's own keyboard
  contract, and zag's menu already does typeahead (printable characters jump to a
  matching item, on by default), which is the same affordance without the
  semantic damage.
-->
<script setup lang="ts">
import { computed } from "vue";
import { Button, Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";

const props = withDefaults(defineProps<{ label?: string; iconOnly?: boolean; class?: string }>(), {
  label: "Add filter",
  iconOnly: false,
});
const table = useTableContext();
const fields = computed(() => table.filters.fields.value);
</script>

<template>
  <Menu v-if="fields.length > 0">
    <!--
      The two presentations are the two places this appears, not a free choice:
      the header's is the funnel that *starts* filtering, the bar's is the plus
      that adds another to a list that already exists.

      `aria-label` on the trigger also names the menu it opens: zag points the
      menu's `aria-labelledby` at its trigger, which wins over any `aria-label`
      set on the content. So the button's name has to be the *menu's* name too —
      "Add filter", not "Filter".
    -->
    <MenuTrigger as-child>
      <Button
        v-if="iconOnly"
        intent="secondary"
        :size="table.size.value"
        icon="filter"
        :aria-label="props.label"
        :class="$props.class"
      />
      <Button v-else intent="ghost" size="sm" icon="plus" :class="$props.class">
        {{ props.label }}
      </Button>
    </MenuTrigger>
    <MenuContent align="end" class="data-table__filter-picker">
      <!--
        A field that already carries conditions stays in the list — several
        conditions on one column is the point — with a count so it is obvious
        this adds another rather than replacing.
      -->
      <MenuItem
        v-for="field in fields"
        :key="field.columnId"
        :value="field.columnId"
        @select="table.filters.add(field.columnId)"
      >
        {{ field.count > 0 ? `${field.label} (${field.count})` : field.label }}
      </MenuItem>
    </MenuContent>
  </Menu>
</template>
