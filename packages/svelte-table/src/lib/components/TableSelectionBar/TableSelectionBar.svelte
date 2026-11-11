<!--
  Appears only while something is selected, and then takes the place of the
  toolbar's sort, filter and table actions: with rows selected, what to do with
  them is the decision in front of the user, so it sits where they were already
  looking rather than on a line of its own. The count, and the offer to select
  the rows off screen, are in `TableSelectionFooter` under the rows.

  Plain buttons in a labelled group, with no surface of its own. It shares the
  toolbar row with the search box, so `role="toolbar"`'s roving focus would make
  it the only cluster in that row that Tab skips through. Destructive actions
  route through `AlertDialog`; "archive 40,000 rows" is not an undo-able
  mis-click.
-->
<script lang="ts" generics="T extends RowData">
  import { clsx } from "clsx";
  import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogConfirm,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
    Button,
  } from "@ui-organized/svelte";
  import type { RowData } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import type { BulkAction } from "../../core/types.js";

  let { actions, class: className }: { actions?: BulkAction<T>[]; class?: string } = $props();
  const table = getTable<T>();

  let confirming = $state<BulkAction<T> | null>(null);
  const items = $derived(actions ?? table.options.bulkActions ?? []);
  const count = $derived(table.selection.count);
  const rowsWord = $derived(count === 1 ? "1 row" : `${count} rows`);

  const run = (action: BulkAction<T>) => {
    void action.onRun(table.selection.rows, table.selection.asBulk());
  };
  const choose = (action: BulkAction<T>) => {
    if (action.destructive) confirming = action;
    else run(action);
  };
</script>

{#if count > 0}
  <div role="group" class={clsx("data-table__selection-bar", className)} aria-label="Bulk actions">
    {#each items as action (action.id)}
      <Button
        size={table.size}
        intent={action.destructive ? "destructive-ghost" : "ghost"}
        icon={action.icon}
        onclick={() => choose(action)}
      >
        {action.label}
      </Button>
    {/each}

    <Button size={table.size} intent="ghost" onclick={() => table.selection.clear()}>
      Clear
    </Button>

    <AlertDialog open={confirming !== null} onOpenChange={(open) => !open && (confirming = null)}>
      <AlertDialogContent>
        <AlertDialogTitle>
          {confirming?.confirm?.title ?? `${confirming?.label ?? "Continue"}?`}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {confirming?.confirm?.description ??
            `This will ${confirming?.label.toLowerCase() ?? "act on"} ${rowsWord}. This cannot be undone.`}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogConfirm
            intent="destructive"
            onclick={() => {
              if (confirming) run(confirming);
              confirming = null;
            }}
          >
            {confirming?.confirm?.confirmLabel ?? confirming?.label ?? "Confirm"}
          </AlertDialogConfirm>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
{/if}
