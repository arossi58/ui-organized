<!--
  The panel's title bar. Wraps its children in the drag handle, so grabbing the
  header is what moves the panel — which is why the title and close button go
  inside this part rather than straight into the content.
-->
<script setup lang="ts">
import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/vue";
</script>

<template>
  <ArkFloatingPanel.Header class="floating-panel__header">
    <ArkFloatingPanel.DragTrigger class="floating-panel__drag">
      <slot />
    </ArkFloatingPanel.DragTrigger>
  </ArkFloatingPanel.Header>
</template>
