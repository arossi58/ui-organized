<script setup lang="ts">
import {
  Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose,
} from "@ui-organized/vue";
defineProps<{ contentProps?: Record<string, unknown> }>();
</script>

<template>
  <Popover v-bind="$attrs">
    <PopoverTrigger>Open</PopoverTrigger>
    <PopoverContent v-bind="contentProps">
      <PopoverTitle>Title</PopoverTitle>
      <PopoverDescription>Description</PopoverDescription>
      <PopoverClose>Close</PopoverClose>
    </PopoverContent>
  </Popover>
</template>
