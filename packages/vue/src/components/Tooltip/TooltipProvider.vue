<!-- Shares hover/close delays across the tooltips it wraps. Optional, app-level. -->
<script setup lang="ts">
import { computed } from "vue";
import { provideTooltipDelays } from "./delays.js";
import type { TooltipProviderProps } from "./Tooltip.types.js";

const props = defineProps<TooltipProviderProps>();
provideTooltipDelays(computed(() => ({ delay: props.delay, closeDelay: props.closeDelay })));
</script>

<template><slot /></template>
