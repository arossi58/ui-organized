<script setup lang="ts">
import { Menu as ArkMenu } from "@ark-ui/vue";
</script>

<template>
  <ArkMenu.ItemGroup class="context-menu__group"><slot /></ArkMenu.ItemGroup>
</template>
