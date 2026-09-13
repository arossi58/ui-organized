<!-- The header's tri-state checkbox: it governs the rows on screen. -->
<script lang="ts">
  import { Checkbox } from "@ui-organized/svelte";
  import { getTable } from "./tableContext.js";

  const table = getTable();
</script>

<span class="data-table__select-hit">
  <Checkbox
    checked={table.selection.header.checked}
    indeterminate={table.selection.header.indeterminate}
    aria-label={`Select the rows shown in ${table.label}`}
    onCheckedChange={(checked) => table.selection.togglePage(checked)}
  />
</span>
