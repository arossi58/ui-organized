<!--
  Column visibility, and — when reordering is on — the keyboard-reachable half of
  reordering. A drag-only affordance fails the a11y gate, so the menu is the
  primary control and the drag is the enhancement.
-->
<script lang="ts">
  import {
    Button,
    Menu,
    MenuCheckboxItem,
    MenuContent,
    MenuGroup,
    MenuGroupLabel,
    MenuItem,
    MenuSeparator,
    MenuTrigger,
  } from "@ui-organized/svelte";
  import { toggleableColumns } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";

  let { label = "Columns", class: className }: { label?: string; class?: string } = $props();
  const table = getTable();
  const columns = $derived(toggleableColumns(table.table.getAllLeafColumns()));
  const headerOf = (column: (typeof columns)[number]) =>
    typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;
</script>

{#if columns.length > 0}
  <Menu>
    <MenuTrigger>
      {#snippet asChild(props)}
        <Button
          {...(props() as Record<string, never>)}
          intent="secondary"
          size={table.size}
          icon="settings"
          aria-label={label}
        />
      {/snippet}
    </MenuTrigger>
    <MenuContent align="end" class={className}>
      <MenuGroup>
        <MenuGroupLabel>Visible columns</MenuGroupLabel>
        {#each columns as column (column.id)}
          <MenuCheckboxItem
            value={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(checked) => column.toggleVisibility(checked)}
          >
            {headerOf(column)}
          </MenuCheckboxItem>
        {/each}
      </MenuGroup>
      {#if table.options.reorderable}
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>Reset</MenuGroupLabel>
          <MenuItem value="reset-order" onSelect={() => table.table.resetColumnOrder()}>
            Reset column order
          </MenuItem>
          <MenuItem value="reset-sizing" onSelect={() => table.table.resetColumnSizing()}>
            Reset column widths
          </MenuItem>
        </MenuGroup>
      {/if}
    </MenuContent>
  </Menu>
{/if}
