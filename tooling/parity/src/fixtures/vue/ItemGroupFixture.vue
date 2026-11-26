<script setup lang="ts">
import { Item, ItemGroup } from "@ui-organized/vue";
// Two fixed rows; see cases/ItemGroup.tsx.
defineProps<{ itemVariant?: "plain" | "outline" | "muted" }>();
</script>

<template>
  <ItemGroup v-bind="$attrs as any">
    <Item :variant="itemVariant" title="Product updates" description="News about releases." />
    <Item :variant="itemVariant" title="Weekly digest" href="/digest" />
  </ItemGroup>
</template>
