<script setup lang="ts">
import { Drawer as ArkDrawer } from "@ark-ui/vue";
import { DRAWER_CLASS } from "@ui-organized/core";
</script>

<template>
  <ArkDrawer.Title :class="DRAWER_CLASS.title"><slot /></ArkDrawer.Title>
</template>
