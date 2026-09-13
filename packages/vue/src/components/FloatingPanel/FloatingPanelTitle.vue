<!-- Heading for the panel, and the thing that names it. -->
<script setup lang="ts">
import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/vue";
</script>

<template>
  <ArkFloatingPanel.Title class="floating-panel__title text-strong-body-large">
    <slot />
  </ArkFloatingPanel.Title>
</template>
