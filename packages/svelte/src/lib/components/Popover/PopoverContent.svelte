<!-- Portalled, positioned surface holding the popover body. -->
<script lang="ts">
  import { Popover as ArkPopover, Portal } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { setAnchoredPositioning, toPlacement } from "./positioning.svelte.js";
  import type { PopoverContentProps } from "./Popover.types.js";

  let {
    side = "bottom",
    align = "center",
    sideOffset = 8,
    alignOffset,
    container,
    class: className,
    children,
    ...contentProps
  }: PopoverContentProps = $props();

  // Registered with the Root during initialisation, as an accessor so a later
  // change to side/align/sideOffset is picked up — see ./positioning.svelte.ts.
  setAnchoredPositioning(() => ({
    placement: toPlacement(side, align),
    gutter: sideOffset,
    offset: alignOffset != null ? { crossAxis: alignOffset } : undefined,
  }));
</script>

<Portal container={container ?? undefined}>
  <!--
    The positioner class must stay a plain string literal: the overlay-stacking
    test scans for it, and stacking is declared on the popup rather than here
    because zag writes an inline z-index onto the positioner and reads it from
    the popup's rule.
  -->
  <ArkPopover.Positioner class="popover__positioner">
    <ArkPopover.Content
      class={clsx("popover__popup", "text-default-body-medium", className)}
      {...contentProps}
    >
      {@render children?.()}
    </ArkPopover.Content>
  </ArkPopover.Positioner>
</Portal>
