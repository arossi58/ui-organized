<script setup lang="ts">
import { computed } from "vue";
import { clsx } from "clsx";
import { getHeaderRowProps } from "@ui-organized/table-core";
import { useTableContext } from "../../core/tableContext.js";
import { vueProps } from "../../core/props.js";
import TableHeadCell from "./TableHeadCell.vue";

defineProps<{ class?: string }>();
const table = useTableContext();
const groups = computed(() => table.table.getHeaderGroups());
const rowProps = getHeaderRowProps();
</script>

<template>
  <thead :class="clsx('data-table__head', $props.class)">
    <tr v-for="group in groups" :key="group.id" v-bind="vueProps(rowProps)">
      <TableHeadCell
        v-for="(header, index) in group.headers"
        :key="header.id"
        :header="header"
        :index="index"
      />
    </tr>
  </thead>
</template>
