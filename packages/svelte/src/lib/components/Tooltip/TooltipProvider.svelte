<!-- Shares hover/close delays across the tooltips it wraps. Optional, app-level. -->
<script lang="ts">
  import { setTooltipDelays } from "./delays.svelte.js";
  import type { TooltipProviderProps } from "./Tooltip.types.js";

  let { children, delay, closeDelay }: TooltipProviderProps = $props();

  setTooltipDelays(() => ({ delay, closeDelay }));
</script>

{@render children()}
