<script setup lang="ts">
import {
  Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerDescription, DrawerClose, DrawerFooter,
} from "@ui-organized/vue";
defineProps<{ contentProps?: Record<string, unknown> }>();
</script>

<template>
  <Drawer v-bind="$attrs">
    <DrawerTrigger>Open</DrawerTrigger>
    <DrawerContent v-bind="contentProps">
      <DrawerTitle>Title</DrawerTitle>
      <DrawerDescription>Description</DrawerDescription>
      <DrawerFooter>
        <DrawerClose>Close</DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
