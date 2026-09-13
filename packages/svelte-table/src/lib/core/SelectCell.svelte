<!--
  A row's selection checkbox, with shift-click range selection.

  Given a `Checkbox` with a closed prop API — no ref, no `onclick`, no `data-*`
  passthrough — the wrapper records `shiftKey` from the pointer or keyboard event
  that *precedes* the change, which the change handler then reads. It needs no
  change to `@ui-organized/svelte`, which is the point: widening a component's
  API to serve one consumer is how a design system's props turn into a junk
  drawer.
-->
<script lang="ts">
  import { Checkbox } from "@ui-organized/svelte";
  import { getTable } from "./tableContext.js";

  let { rowId, rowLabel }: { rowId: string; rowLabel: string } = $props();
  const table = getTable();

  let shift = false;
  const remember = (event: MouseEvent | KeyboardEvent) => {
    shift = event.shiftKey;
  };
</script>

<span
  class="data-table__select-hit"
  onmousedowncapture={remember}
  onkeydowncapture={remember}
>
  <Checkbox
    checked={table.selection.isSelected(rowId)}
    aria-label={rowLabel}
    onCheckedChange={(checked) => {
      table.selection.toggle(rowId, checked, shift);
      shift = false;
    }}
  />
</span>
