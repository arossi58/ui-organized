<!--
  The applied filters, on their own line under the header (Figma 2298:362).

  A *summary*, not a control panel: the filter button lives in the header above,
  and this line does not exist until the user has actually filtered something. A
  bar that is always present and usually empty is chrome that teaches people to
  stop looking at it.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { Button } from "@ui-organized/svelte";
  import { getTable } from "../../core/tableContext.js";
  import TableFilterAdd from "./TableFilterAdd.svelte";
  import TableFilterChip from "./TableFilterChip.svelte";

  let { class: className }: { class?: string } = $props();
  const table = getTable();
  const conditions = $derived(table.filters.conditions);
  const render = $derived(table.options.filterable !== false && conditions.length > 0);
</script>

<!--
  `role="group"`, not `role="toolbar"`: toolbar promises arrow-key navigation
  between its controls, and until that lands the promise would be a lie to
  assistive tech.
-->
{#if render}
  <div class={clsx("data-table__filters", className)} role="group" aria-label="Filters">
    <span class="data-table__filters-label">Filters</span>

    {#each conditions as condition (condition.id)}
      <TableFilterChip {condition} />
    {/each}

    <TableFilterAdd label="Add" />

    <Button intent="ghost" size="sm" icon="rotate-ccw" onclick={() => table.filters.clear()}>
      Reset
    </Button>

    <!--
      One polite region for add / remove / change / clear. Deliberately not a
      visible count: that changes on every keystroke elsewhere, and a live region
      that re-announces per keystroke is a firehose.
    -->
    <span class="data-table__sr-only" role="status" aria-live="polite">
      {table.filters.announcement}
    </span>
  </div>
{/if}
