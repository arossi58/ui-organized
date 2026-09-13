<!--
  The field picker, in both the shapes the design uses it: the header's icon-only
  button (Figma 2298:336) and the filter bar's "＋ Add" (2298:531).

  A `Menu`, like every other menu the table puts in its chrome
  (`TableViewOptions`, `TableExportMenu`, `TableRowActions`). Picking a field
  *does* something — it adds a filter and opens that filter's editor — so
  `role="menu"` with `menuitem` children is the honest semantic.

  No search box: a text input inside `role="menu"` breaks the menu's own keyboard
  contract, and zag's menu already does typeahead, which is the same affordance
  without the semantic damage.
-->
<script lang="ts">
  import { Button, Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-organized/svelte";
  import { getTable } from "../../core/tableContext.js";

  let {
    label = "Add filter",
    iconOnly = false,
    class: className,
  }: { label?: string; iconOnly?: boolean; class?: string } = $props();

  const table = getTable();
  const fields = $derived(table.filters.fields);
</script>

{#if fields.length > 0}
  <Menu>
    <!--
      The two presentations are the two places this appears, not a free choice:
      the header's is the funnel that *starts* filtering, the bar's is the plus
      that adds another to a list that already exists.

      `aria-label` on the trigger also names the menu it opens: zag points the
      menu's `aria-labelledby` at its trigger, which wins over any `aria-label`
      set on the content. So the button's name has to be the *menu's* name too —
      "Add filter", not "Filter".
    -->
    <MenuTrigger>
      {#snippet asChild(props)}
        {#if iconOnly}
          <Button
            {...(props() as Record<string, never>)}
            intent="secondary"
            size={table.size}
            icon="filter"
            aria-label={label}
            class={className}
          />
        {:else}
          <Button
            {...(props() as Record<string, never>)}
            intent="ghost"
            size="sm"
            icon="plus"
            class={className}
          >
            {label}
          </Button>
        {/if}
      {/snippet}
    </MenuTrigger>
    <MenuContent align="end" class="data-table__filter-picker">
      <!--
        A field that already carries conditions stays in the list — several
        conditions on one column is the point — with a count so it is obvious
        this adds another rather than replacing.
      -->
      {#each fields as field (field.columnId)}
        <MenuItem value={field.columnId} onSelect={() => table.filters.add(field.columnId)}>
          {field.count > 0 ? `${field.label} (${field.count})` : field.label}
        </MenuItem>
      {/each}
    </MenuContent>
  </Menu>
{/if}
