<!--
  Export scopes are separate items rather than one button, because "download"
  means three different things depending on what is filtered and what is ticked —
  and silently picking one is how an export loses rows.
-->
<script lang="ts">
  import {
    Button,
    Menu,
    MenuContent,
    MenuItem,
    MenuSeparator,
    MenuTrigger,
  } from "@ui-organized/svelte";
  import { getTable } from "../../core/tableContext.js";
  import { internalGlyph as glyph } from "@ui-organized/svelte";

  let { label = "Export", class: className }: { label?: string; class?: string } = $props();
  const table = getTable();
  const hasSelection = $derived(table.selection.count > 0);
</script>

<Menu>
  <MenuTrigger>
    {#snippet asChild(props)}
      <Button
        {...props()}
        intent="secondary"
        size={table.size}
        icon={glyph("download")}
        aria-label={label}
      />
    {/snippet}
  </MenuTrigger>
  <MenuContent align="end" class={className}>
    <MenuItem value="csv-view" icon={glyph("download")} onSelect={() => table.exportCsv("view")}>
      Download this view (CSV)
    </MenuItem>
    <MenuItem
      value="csv-selected"
      icon={glyph("download")}
      disabled={!hasSelection}
      onSelect={() => table.exportCsv("selected")}
    >
      Download selected rows (CSV)
    </MenuItem>
    <MenuItem value="csv-all" icon={glyph("download")} onSelect={() => table.exportCsv("all")}>
      Download all rows (CSV)
    </MenuItem>
    <MenuSeparator />
    <MenuItem
      value="copy"
      icon={glyph("copy")}
      disabled={!hasSelection}
      onSelect={() => void table.copySelection("selected")}
    >
      Copy selection to clipboard
    </MenuItem>
  </MenuContent>
</Menu>
