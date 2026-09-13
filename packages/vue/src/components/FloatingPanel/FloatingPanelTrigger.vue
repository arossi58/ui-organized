<!-- Element that opens the panel. -->
<script setup lang="ts">
import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/vue";
</script>

<template>
  <ArkFloatingPanel.Trigger><slot /></ArkFloatingPanel.Trigger>
</template>
