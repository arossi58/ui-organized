<!--
  Sorting, from the header rather than from a column.

  The column headers already sort, so in table mode this is a convenience. In
  **card mode it is the only sort control there is** — there are no headers to
  click — and a table that silently loses the ability to sort at 640px is a table
  that is broken on phones.

  One column at a time. Multi-column sort stays where it is discoverable and
  cheap: shift-clicking headers.
-->
<script lang="ts">
  import {
    Button,
    Menu,
    MenuContent,
    MenuGroup,
    MenuGroupLabel,
    MenuItem,
    MenuRadioGroup,
    MenuRadioItem,
    MenuSeparator,
    MenuTrigger,
  } from "@ui-organized/svelte";
  import { getTable } from "../../core/tableContext.js";

  let { label = "Sort", class: className }: { label?: string; class?: string } = $props();
  const table = getTable();

  const columns = $derived(table.table.getAllLeafColumns().filter((c) => c.getCanSort()));
  const active = $derived(table.state.sorting?.[0]);
  const activeId = $derived(active?.id ?? "");
  const direction = $derived(active?.desc ? "desc" : "asc");
  const triggerIcon = $derived(activeId ? (active?.desc ? "sort-desc" : "sort-asc") : "sort");

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
          icon={triggerIcon}
          aria-label={label}
          class={className}
        />
      {/snippet}
    </MenuTrigger>
    <MenuContent align="end" class="data-table__sort-menu">
      <MenuGroup>
        <MenuGroupLabel>Sort by</MenuGroupLabel>
        <MenuRadioGroup
          value={activeId}
          onValueChange={(id) =>
            table.table.setSorting(id ? [{ id, desc: direction === "desc" }] : [])}
        >
          {#each columns as column (column.id)}
            <MenuRadioItem value={column.id}>{headerOf(column)}</MenuRadioItem>
          {/each}
        </MenuRadioGroup>
      </MenuGroup>

      <MenuSeparator />

      <MenuGroup>
        <MenuGroupLabel>Direction</MenuGroupLabel>
        <MenuRadioGroup
          value={direction}
          onValueChange={(next) => {
            if (activeId) table.table.setSorting([{ id: activeId, desc: next === "desc" }]);
          }}
        >
          <!--
            Disabled rather than hidden: the choice is always part of the menu's
            shape, and a menu that changes length as you use it is harder to aim
            at the second time.
          -->
          <MenuRadioItem value="asc" disabled={!activeId}>Ascending</MenuRadioItem>
          <MenuRadioItem value="desc" disabled={!activeId}>Descending</MenuRadioItem>
        </MenuRadioGroup>
      </MenuGroup>

      {#if activeId}
        <MenuSeparator />
        <MenuItem value="clear-sorting" onSelect={() => table.table.setSorting([])}>
          Clear sorting
        </MenuItem>
      {/if}
    </MenuContent>
  </Menu>
{/if}
