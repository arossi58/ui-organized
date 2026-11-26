<script setup lang="ts">
import { Drawer as ArkDrawer } from "@ark-ui/vue";
import { DRAWER_CLASS } from "@ui-organized/core";
</script>

<template>
  <ArkDrawer.Description :class="DRAWER_CLASS.description"><slot /></ArkDrawer.Description>
</template>
