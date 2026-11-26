<script setup lang="ts">
import { PageHeader } from "@ui-organized/vue";
// The `with*` flags stand for the slots; see cases/PageHeader.tsx.
defineProps<{ withBreadcrumbs?: boolean; withActions?: boolean; withTabs?: boolean }>();
</script>

<template>
  <PageHeader v-bind="$attrs as any">
    <template v-if="withBreadcrumbs" #breadcrumbs><a href="/">Home</a></template>
    <template v-if="withActions" #actions><button type="button">Edit</button></template>
    <template v-if="withTabs" #tabs><div>Overview</div></template>
  </PageHeader>
</template>
