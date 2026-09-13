<!--
  The panel surface itself, portalled and positioned.

  Unlike every other overlay in this package, FloatingPanel is **not**
  popper-backed — its positioner carries only the drag position and no inline
  `z-index`. It still declares stacking on the content rather than the
  positioner, and is still registered in `POPPER_LAYERS`, so the same "style the
  popup" rule and the same tier assertion cover it.
-->
<script lang="ts">
  import { FloatingPanel as ArkFloatingPanel, Portal } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { floatingPanelStyles } from "@ui-organized/core";
  import type { FloatingPanelContentProps } from "./FloatingPanel.types.js";

  let { size, variant, container, class: className, children }: FloatingPanelContentProps =
    $props();

  /* Resize handles on all four edges and corners. zag positions each from its
     `axis`; only the hit area is styled. */
  const AXES = ["n", "e", "s", "w", "ne", "se", "sw", "nw"] as const;
</script>

<Portal container={container ?? undefined}>
  <!--
    The positioner class must stay a plain string literal — the overlay-stacking
    test scans for it.
  -->
  <ArkFloatingPanel.Positioner class="floating-panel__positioner">
    <ArkFloatingPanel.Content class={clsx(floatingPanelStyles({ size, variant }), className)}>
      {@render children?.()}
      {#each AXES as axis (axis)}
        <ArkFloatingPanel.ResizeTrigger
          {axis}
          class={`floating-panel__resize floating-panel__resize--${axis}`}
        />
      {/each}
    </ArkFloatingPanel.Content>
  </ArkFloatingPanel.Positioner>
</Portal>
