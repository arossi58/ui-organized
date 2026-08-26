<script setup lang="ts">
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter,
} from "@ui-organized/vue";
defineProps<{ contentProps?: Record<string, unknown> }>();
</script>

<template>
  <Dialog v-bind="$attrs">
    <DialogTrigger>Open</DialogTrigger>
    <DialogContent v-bind="contentProps">
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
      <DialogFooter>Footer</DialogFooter>
    </DialogContent>
  </Dialog>
</template>
