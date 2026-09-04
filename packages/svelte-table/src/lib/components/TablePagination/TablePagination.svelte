<!--
  Wraps the library's `Pagination`, which takes a page *count* — the conversion
  from row count and page size happens here so consumers never do that arithmetic
  themselves and get the off-by-one wrong.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { Pagination, Select } from "@ui-organized/svelte";
  import { PAGE_SIZE_OPTIONS } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";

  let {
    showPageSize = true,
    pageSizes = [...PAGE_SIZE_OPTIONS],
    class: className,
  }: { showPageSize?: boolean; pageSizes?: number[]; class?: string } = $props();

  const table = getTable();
  const pagination = $derived(table.state.pagination);
  const pageIndex = $derived(pagination?.pageIndex ?? 0);
  const pageSize = $derived(pagination?.pageSize ?? 10);
  const total = $derived(table.selection.totalMatching);
  const pageCount = $derived(Math.max(1, Math.ceil(total / pageSize)));

  const first = $derived(total === 0 ? 0 : pageIndex * pageSize + 1);
  const last = $derived(Math.min(total, (pageIndex + 1) * pageSize));
  const status = $derived(total === 0 ? "No rows" : `${first}–${last} of ${total}`);
  const sizeOptions = $derived(
    pageSizes.map((entry) => ({ value: String(entry), label: String(entry) })),
  );
</script>

<div class={clsx("data-table__pagination", className)}>
  <!--
    Announced on change, because the rows it describes change underneath a screen
    reader user with no other signal that anything happened.
  -->
  <span class="data-table__pagination-status" aria-live="polite">{status}</span>

  <Pagination
    page={pageIndex + 1}
    count={pageCount}
    onPageChange={(page) => table.table.setPageIndex(page - 1)}
  />

  {#if showPageSize}
    <div class="data-table__page-size">
      <Select
        size={table.size}
        variant="ghost"
        label="Rows per page"
        value={String(pageSize)}
        options={sizeOptions}
        onValueChange={(next) => table.table.setPageSize(Number(next))}
      />
    </div>
  {/if}
</div>
