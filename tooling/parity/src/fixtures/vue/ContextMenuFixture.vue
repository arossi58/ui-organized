<script setup lang="ts">
import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator,
} from "@ui-organized/vue";
defineProps<{ contentProps?: Record<string, unknown> }>();
</script>

<template>
  <ContextMenu v-bind="$attrs">
    <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
    <ContextMenuContent v-bind="contentProps">
      <ContextMenuItem value="a">Cut</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem value="b" destructive>Delete</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
