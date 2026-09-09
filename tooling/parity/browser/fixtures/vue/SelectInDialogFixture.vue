<script setup lang="ts">
import { Dialog, DialogTrigger, DialogContent, DialogTitle, Select } from "@ui-organized/vue";

withDefaults(defineProps<{ options?: { value: string; label: string }[] }>(), {
  options: () => [],
});
</script>

<template>
  <Dialog>
    <DialogTrigger>Open</DialogTrigger>
    <DialogContent>
      <DialogTitle>Title</DialogTitle>
      <Select :options="options" label="Fruit" />
    </DialogContent>
  </Dialog>
</template>
