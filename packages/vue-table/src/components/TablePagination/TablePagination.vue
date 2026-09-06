<!--
  Wraps the library's `Pagination`, which takes a page *count* — the conversion
  from row count and page size happens here so consumers never do that arithmetic
  themselves and get the off-by-one wrong.
-->
<script setup lang="ts">
import { computed } from "vue";
import { clsx } from "clsx";
import { Pagination, Select } from "@ui-organized/vue";
import { PAGE_SIZE_OPTIONS, pageSizeOptions } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";

const props = withDefaults(
  defineProps<{ showPageSize?: boolean; pageSizes?: number[]; class?: string }>(),
  { showPageSize: true, pageSizes: () => [...PAGE_SIZE_OPTIONS] },
);

const table = useTableContext();
const pagination = computed(() => table.state.value.pagination);
const pageIndex = computed(() => pagination.value?.pageIndex ?? 0);
const pageSize = computed(() => pagination.value?.pageSize ?? 10);
const total = computed(() => table.selection.totalMatching.value);
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

const first = computed(() => (total.value === 0 ? 0 : pageIndex.value * pageSize.value + 1));
const last = computed(() => Math.min(total.value, (pageIndex.value + 1) * pageSize.value));
const status = computed(() =>
  total.value === 0 ? "No rows" : `${first.value}–${last.value} of ${total.value}`,
);
const sizeOptions = computed(() =>
  pageSizeOptions(props.pageSizes, pageSize.value).map((entry) => ({
    value: String(entry),
    label: String(entry),
  })),
);
</script>

<template>
  <div :class="clsx('data-table__pagination', $props.class)">
    <!--
      Announced on change, because the rows it describes change underneath a
      screen reader user with no other signal that anything happened.
    -->
    <span class="data-table__pagination-status" aria-live="polite">{{ status }}</span>

    <Pagination
      :page="pageIndex + 1"
      :count="pageCount"
      @page-change="(page: number) => table.table.setPageIndex(page - 1)"
    />

    <div v-if="showPageSize" class="data-table__page-size">
      <Select
        :size="table.size.value"
        variant="ghost"
        label="Rows per page"
        :model-value="String(pageSize)"
        :options="sizeOptions"
        @update:model-value="(next: string) => table.table.setPageSize(Number(next))"
      />
    </div>
  </div>
</template>
