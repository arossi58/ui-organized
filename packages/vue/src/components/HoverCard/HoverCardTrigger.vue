<!--
  The element that reveals the card on hover/focus. Pass `asChild` to project a
  custom element, which is what a link-shaped trigger wants.

  No `popupControls` here, unlike Popover and Menu: zag's hover-card trigger
  carries no `aria-controls` to begin with, so there is no dangling reference to
  drop while the card is closed.
-->
<script setup lang="ts">
import { HoverCard as ArkHoverCard } from "@ark-ui/vue";
defineProps<{ asChild?: boolean }>();
</script>

<template>
  <ArkHoverCard.Trigger :as-child="asChild"><slot /></ArkHoverCard.Trigger>
</template>
