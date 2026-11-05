<!--
  The button both card-mode sheets open from. The count is a badge inside the
  label, and is spoken as words — "Filter, 2 applied" — because a bare "2"
  announced after "Filter" says nothing about what it counts.
-->
<script lang="ts">
  import { Button } from "@ui-organized/svelte";
  import type { CanonicalIconName } from "@ui-organized/utils";
  import { getTable } from "../../core/tableContext.js";

  let {
    icon,
    label,
    count,
    unit,
    class: className,
    ...rest
  }: {
    /** A canonical icon name. */
    icon: string;
    label: string;
    /** What is applied. Drawn as a badge from 1 up, and spoken as words. */
    count: number;
    /** The word the count is read with: "2 applied". */
    unit: string;
    class?: string;
    [key: string]: unknown;
  } = $props();

  const table = getTable();
</script>

<Button
  {...rest as Record<string, never>}
  intent="secondary"
  size={table.size}
  icon={icon as CanonicalIconName}
  class={className}
>
  {label}
  {#if count > 0}
    <span class="data-table__badge" aria-hidden="true">{count}</span>
    <span class="data-table__sr-only">{`, ${count} ${unit}`}</span>
  {/if}
</Button>
