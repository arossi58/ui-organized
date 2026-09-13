<!-- Closes the panel when activated. -->
<script setup lang="ts">
import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/vue";
import Icon from "../Icon/Icon.vue";

/** Header affordances stay a fixed small edge — they mark the chrome rather
 *  than scaling with the panel's body text. */
const HEADER_ICON_SIZE = 16;
</script>

<template>
  <ArkFloatingPanel.CloseTrigger class="floating-panel__close" aria-label="Close panel">
    <slot><Icon name="close" :size="HEADER_ICON_SIZE" /></slot>
  </ArkFloatingPanel.CloseTrigger>
</template>
