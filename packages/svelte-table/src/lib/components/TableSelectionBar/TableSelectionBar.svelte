<!--
  Appears only while something is selected.

  A `Toolbar` this time — it genuinely is a cluster of buttons, which is what
  `role="toolbar"` and its roving focus are for. Destructive actions route
  through `AlertDialog`; "archive 40,000 rows" is not an undo-able mis-click.
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
    Toolbar,
  } from "@ui-organized/svelte";
  import type { CanonicalIconName } from "@ui-organized/utils";
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
  <Toolbar class={clsx("data-table__selection-bar", className)} aria-label="Bulk actions">
    <span class="data-table__selection-count" aria-live="polite">
      {count === 1 ? "1 row selected" : `${count} rows selected`}
    </span>

    {#if table.selection.canSelectAllMatching}
      <span class="data-table__selection-all">
        <button
          type="button"
          class="data-table__selection-link"
          onclick={() => table.selection.selectAllMatching()}
        >
          Select all {table.selection.totalMatching} matching rows
        </button>
      </span>
    {/if}

    {#each items as action (action.id)}
      <Button
        size={table.size}
        intent={action.destructive ? "destructive-ghost" : "ghost"}
        icon={action.icon as CanonicalIconName | undefined}
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
  </Toolbar>
{/if}
