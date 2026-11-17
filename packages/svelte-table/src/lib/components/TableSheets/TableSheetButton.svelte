<!--
  The button both card-mode sheets open from. The count is a badge inside the
  label, and is spoken as words — "Filter, 2 applied" — because a bare "2"
  announced after "Filter" says nothing about what it counts.
-->
<script lang="ts">
  import { Button } from "@ui-organized/svelte";
  import type { ButtonProps, IconComponent, IconName } from "@ui-organized/svelte";
  import type { ClassValue } from "svelte/elements";
  import { getTable } from "../../core/tableContext.js";

  // Everything else is the Button's own props, typed as such, because this sits
  // on the receiving end of a SheetTrigger's `asChild` and forwards what it is
  // handed. An index signature of `unknown` here needed a cast to reach the
  // Button at all.
  let {
    icon,
    label,
    count,
    unit,
    ...rest
  }: Omit<ButtonProps, "intent" | "size" | "icon" | "children" | "asChild"> & {
    icon: IconName | IconComponent;
    label: string;
    /** What is applied. Drawn as a badge from 1 up, and spoken as words. */
    count: number;
    /** The word the count is read with: "2 applied". */
    unit: string;
    /** Merged after the Button's own classes. */
    class?: ClassValue | null;
  } = $props();

  const table = getTable();
</script>

<Button
  {...rest}
  intent="secondary"
  size={table.size}
  {icon}
>
  {label}
  {#if count > 0}
    <span class="data-table__badge" aria-hidden="true">{count}</span>
    <span class="data-table__sr-only">{`, ${count} ${unit}`}</span>
  {/if}
</Button>
