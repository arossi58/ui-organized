<!-- Scrollable body below the header. -->
<script setup lang="ts">
import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/vue";
</script>

<template>
  <ArkFloatingPanel.Body class="floating-panel__body text-default-body-medium">
    <slot />
  </ArkFloatingPanel.Body>
</template>
