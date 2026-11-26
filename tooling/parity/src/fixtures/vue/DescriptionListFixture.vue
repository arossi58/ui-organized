<script setup lang="ts">
import { DescriptionList, DescriptionListItem } from "@ui-organized/vue";
// `composed` stands for DescriptionListItem children; see cases/DescriptionList.tsx.
defineProps<{ composed?: boolean }>();
</script>

<template>
  <DescriptionList v-bind="$attrs as any">
    <template v-if="composed">
      <DescriptionListItem term="Owner">Ada Lovelace</DescriptionListItem>
      <DescriptionListItem term="Region">Europe (west)</DescriptionListItem>
    </template>
  </DescriptionList>
</template>
