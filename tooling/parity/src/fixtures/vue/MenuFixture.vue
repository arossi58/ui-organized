<script setup lang="ts">
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator } from "@ui-organized/vue";
defineProps<{ contentProps?: Record<string, unknown> }>();
</script>

<template>
  <Menu v-bind="$attrs">
    <MenuTrigger>Open</MenuTrigger>
    <MenuContent v-bind="contentProps">
      <MenuItem value="a">Cut</MenuItem>
      <MenuSeparator />
      <MenuItem value="b" destructive>Delete</MenuItem>
    </MenuContent>
  </Menu>
</template>
