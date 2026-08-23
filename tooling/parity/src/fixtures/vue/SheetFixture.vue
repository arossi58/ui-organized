<script setup lang="ts">
import {
  Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription, SheetClose, SheetFooter,
} from "@ui-organized/vue";
defineProps<{ contentProps?: Record<string, unknown> }>();
</script>

<template>
  <Sheet v-bind="$attrs">
    <SheetTrigger>Open</SheetTrigger>
    <SheetContent v-bind="contentProps">
      <SheetTitle>Title</SheetTitle>
      <SheetDescription>Description</SheetDescription>
      <SheetFooter>
        <SheetClose>Close</SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
