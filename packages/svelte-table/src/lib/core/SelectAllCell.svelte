<!--
  The header's tri-state checkbox: from empty it selects the rows on screen;
  from checked or mixed it clears the selection. What the box shows decides the
  click, not the box's own next state — see `headerToggleTarget`.
-->
<script lang="ts">
  import { Checkbox } from "@ui-organized/svelte";
  import { headerToggleTarget } from "@ui-organized/table-core";
  import { getTable } from "./tableContext.js";

  const table = getTable();
</script>

<span class="data-table__select-hit">
  <Checkbox
    checked={table.selection.header.checked}
    indeterminate={table.selection.header.indeterminate}
    aria-label={`Select the rows shown in ${table.label}`}
    onCheckedChange={() => table.selection.togglePage(headerToggleTarget(table.selection.header))}
  />
</span>
