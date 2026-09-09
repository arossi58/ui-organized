<!--
  The scroll container and the `<table>` element, which are inseparable: a
  viewport with two tables in it means nothing, and `<caption>` and `<colgroup>`
  have to be emitted between them.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { clsx } from "clsx";
  import {
    getCaptionProps,
    getColProps,
    getTableProps,
    getViewportProps,
  } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { elementRef } from "../../core/elementRef.js";
  import { svelteProps } from "../../core/props.js";

  let {
    class: className,
    maxHeight,
    children,
  }: { class?: string; maxHeight?: number | string; children?: Snippet } = $props();

  const table = getTable();
  const viewport = $derived(getViewportProps(table.chrome));
  const tableProps = $derived(getTableProps(table.chrome));
  const caption = $derived(getCaptionProps(table.captionVisible));
  const columns = $derived(table.table.getVisibleLeafColumns());

  const lengthOf = (value: number | string) => (typeof value === "number" ? `${value}px` : value);
  const cap = $derived(maxHeight ?? table.options.maxHeight);
  const style = $derived(
    cap === undefined ? undefined : `--data-table-max-height: ${lengthOf(cap)}`,
  );
</script>

<div
  {...svelteProps(viewport)}
  class={clsx(viewport.className, className)}
  {style}
  use:elementRef={table.viewportRef}
>
  <!--
    One key handler for the whole grid rather than one per cell: the cursor is
    table state, so the key only has to reach the table. It sits on the element
    that carries `role="grid"`, not on the scroll container — which is also what
    stops it being a keyboard handler on a div with no role at all.
  -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <table
    {...svelteProps(tableProps)}
    onkeydown={(event) => (table.interactive ? table.onGridKeyDown(event) : undefined)}
  >
    <!-- First child of <table>, per the content model. -->
    <caption {...svelteProps(caption)}>{table.label}</caption>
    <colgroup>
      {#each columns as column (column.id)}
        <col {...svelteProps(getColProps(table.columnWidths[column.id]))} />
      {/each}
    </colgroup>
    {@render children?.()}
  </table>
</div>
