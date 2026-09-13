<script setup lang="ts">
import { Menu as ArkMenu } from "@ark-ui/vue";
</script>

<template>
  <ArkMenu.ItemGroupLabel class="context-menu__group-label text-strong-body-small">
    <slot />
  </ArkMenu.ItemGroupLabel>
</template>
