<!-- Element that opens the panel. -->
<script lang="ts">
  import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/svelte";
  import type { FloatingPanelTriggerProps } from "./FloatingPanel.types.js";

  let { children, ...rest }: FloatingPanelTriggerProps = $props();
</script>

<ArkFloatingPanel.Trigger {...rest}>
  {@render children?.()}
</ArkFloatingPanel.Trigger>
