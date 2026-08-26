<!-- Closes the popover when activated. Pass `asChild` to project a custom element. -->
<script setup lang="ts">
import { Popover as ArkPopover } from "@ark-ui/vue";
defineProps<{ asChild?: boolean }>();
</script>

<template>
  <ArkPopover.CloseTrigger :as-child="asChild"><slot /></ArkPopover.CloseTrigger>
</template>
