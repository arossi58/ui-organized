<!--
  Export scopes are separate items rather than one button, because "download"
  means three different things depending on what is filtered and what is ticked —
  and silently picking one is how an export loses rows.
-->
<script setup lang="ts">
import { computed } from "vue";
import { Button, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@ui-organized/vue";
import { useTableContext } from "../../core/tableContext.js";

const props = withDefaults(defineProps<{ label?: string; class?: string }>(), { label: "Export" });
const table = useTableContext();
const hasSelection = computed(() => table.selection.count.value > 0);
</script>

<template>
  <Menu>
    <MenuTrigger as-child>
      <Button
        intent="secondary"
        :size="table.size.value"
        icon="download"
        :aria-label="props.label"
      />
    </MenuTrigger>
    <MenuContent align="end" :class="$props.class">
      <MenuItem value="csv-view" icon="download" @select="table.exportCsv('view')">
        Download this view (CSV)
      </MenuItem>
      <MenuItem
        value="csv-selected"
        icon="download"
        :disabled="!hasSelection"
        @select="table.exportCsv('selected')"
      >
        Download selected rows (CSV)
      </MenuItem>
      <MenuItem value="csv-all" icon="download" @select="table.exportCsv('all')">
        Download all rows (CSV)
      </MenuItem>
      <MenuSeparator />
      <MenuItem
        value="copy"
        icon="copy"
        :disabled="!hasSelection"
        @select="table.copySelection('selected')"
      >
        Copy selection to clipboard
      </MenuItem>
    </MenuContent>
  </Menu>
</template>
