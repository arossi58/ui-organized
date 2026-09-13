<!-- Element that toggles the popover. Pass `asChild` to project a custom element. -->
<script setup lang="ts">
import { computed } from "vue";
import { Popover as ArkPopover, usePopoverContext } from "@ark-ui/vue";
import { popupControls } from "@ui-organized/core";
import { definedOnly } from "../../props.js";

defineProps<{ asChild?: boolean }>();
const popover = usePopoverContext();
// Ark keeps aria-controls on the trigger at all times, but the content it names
// is only mounted while open. popupControls drops it while closed — spread, not
// bound, so an undefined never strips the machine's own value. See props.ts.
const controls = computed(() => definedOnly(popupControls(popover.value.open)));
</script>

<template>
  <ArkPopover.Trigger :as-child="asChild" v-bind="controls"><slot /></ArkPopover.Trigger>
</template>
