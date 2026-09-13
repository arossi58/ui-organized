<script lang="ts">
  import { clsx } from "clsx";
  import { SearchInput } from "@ui-organized/svelte";
  import { getTable } from "../../core/tableContext.js";

  let {
    placeholder = "Search",
    label,
    class: className,
  }: { placeholder?: string; label?: string; class?: string } = $props();

  const table = getTable();
  const name = $derived(label ?? `Search ${table.label}`);
</script>

<SearchInput
  class={clsx("data-table__search", className)}
  size={table.size}
  value={table.search}
  {placeholder}
  aria-label={name}
  oninput={(event) => table.setSearch(event.currentTarget.value)}
  onClear={() => table.setSearch("")}
/>
