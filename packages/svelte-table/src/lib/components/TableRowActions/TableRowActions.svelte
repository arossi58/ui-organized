<!--
  Per-row actions, as a menu rather than a row of buttons.

  A menu is one tab stop per row instead of three, which matters a great deal
  when there are two hundred rows — and it is the only affordance that survives
  card mode unchanged.
-->
<script lang="ts" generics="T extends RowData">
  import { Button, Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-organized/svelte";
  import type { CanonicalIconName } from "@ui-organized/utils";
  import type { RowData } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import type { RowAction } from "../../core/types.js";

  let {
    row,
    actions,
    label = "Row actions",
  }: {
    /** The row the actions operate on. */
    row: T;
    /**
     * Overrides the table's own `rowActions`. Only needed when the part is used
     * outside a `<DataTable>`.
     */
    actions?: RowAction<T>[];
    /** Accessible name for the trigger. Defaults to "Row actions". */
    label?: string;
  } = $props();

  const table = getTable<T>();
  const items = $derived(actions ?? table.options.rowActions ?? []);
</script>

{#if items.length > 0}
  <Menu>
    <!--
      `asChild` as a snippet, which is Ark Svelte's own convention: the trigger
      hands its props in and the consumer spreads them at the point of use. That
      is what puts the trigger's `id`, `aria-expanded` and click handler on the
      Button rather than on a wrapper around it.
    -->
    <MenuTrigger>
      {#snippet asChild(props)}
        <Button
          {...(props() as Record<string, never>)}
          intent="ghost"
          size={table.size}
          icon="menu"
          aria-label={label}
        />
      {/snippet}
    </MenuTrigger>
    <MenuContent align="end">
      {#each items as action (action.id)}
        <MenuItem
          value={action.id}
          icon={action.icon as CanonicalIconName | undefined}
          destructive={action.destructive}
          disabled={action.disabled?.(row)}
          onSelect={() => void action.onRun(row)}
        >
          {action.label}
        </MenuItem>
      {/each}
    </MenuContent>
  </Menu>
{/if}
