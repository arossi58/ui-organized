<!-- Closes the drawer when activated. Pass `asChild` to project a custom element. -->
<script setup lang="ts">
import { Drawer as ArkDrawer } from "@ark-ui/vue";

defineProps<{ asChild?: boolean }>();
</script>

<template>
  <ArkDrawer.CloseTrigger :as-child="asChild"><slot /></ArkDrawer.CloseTrigger>
</template>
