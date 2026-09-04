<!--
  Card mode: one card per row, below the breakpoint.

  The table is *replaced*, not hidden — rendering both trees and hiding one with
  a container query would double the DOM and defeat virtualization on exactly the
  devices that can least afford it. Selection, row actions and the detail sheet
  all keep working, because they are table state rather than table markup.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { cardFieldOrder } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { elementRef } from "../../core/elementRef.js";
  import { TableEmpty } from "../TableStates/index.js";
  import TableCard from "./TableCard.svelte";

  let { class: className }: { class?: string } = $props();
  const table = getTable();

  const fields = $derived(cardFieldOrder(table.options.columns));
  const renderRows = $derived(table.renderRows);
  const spacers = $derived(
    table.virtual.enabled ? table.virtual.spacers : { top: 0, bottom: 0 },
  );
  const cap = $derived(table.options.maxHeight);
  const style = $derived(
    cap === undefined
      ? undefined
      : `--data-table-max-height: ${typeof cap === "number" ? `${cap}px` : cap}`,
  );
</script>

{#if renderRows.length === 0}
  <div class={clsx("data-table__cards", className)}>
    <table class="data-table__table">
      <caption class="data-table__sr-only">{table.label}</caption>
      <tbody><TableEmpty /></tbody>
    </table>
  </div>
{:else}
  <ul
    class={clsx("data-table__cards", className)}
    aria-label={table.label}
    {style}
    use:elementRef={table.viewportRef}
  >
    {#if spacers.top > 0}
      <li class="data-table__card-spacer" aria-hidden="true" style={`height: ${spacers.top}px`}></li>
    {/if}
    {#each renderRows as entry (entry.row.id)}
      <TableCard row={entry.row} index={entry.index} {fields} />
    {/each}
    {#if spacers.bottom > 0}
      <li
        class="data-table__card-spacer"
        aria-hidden="true"
        style={`height: ${spacers.bottom}px`}
      ></li>
    {/if}
  </ul>
{/if}
