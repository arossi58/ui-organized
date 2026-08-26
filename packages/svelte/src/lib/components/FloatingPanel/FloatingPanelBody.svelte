<!-- Scrollable body below the header. -->
<script lang="ts">
  import { FloatingPanel as ArkFloatingPanel } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { FloatingPanelBodyProps } from "./FloatingPanel.types.js";

  let { class: className, children, ...rest }: FloatingPanelBodyProps = $props();
</script>

<ArkFloatingPanel.Body
  class={clsx("floating-panel__body", "text-default-body-medium", className)}
  {...rest}
>
  {@render children?.()}
</ArkFloatingPanel.Body>
