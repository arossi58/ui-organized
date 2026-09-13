<!-- Portalled, positioned surface holding the preview content. -->
<script lang="ts">
  import { HoverCard as ArkHoverCard, Portal } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { setAnchoredPositioning, toPlacement } from "../Popover/positioning.svelte.js";
  import type { HoverCardContentProps } from "./HoverCard.types.js";

  let {
    side = "bottom",
    align = "center",
    sideOffset = 8,
    alignOffset,
    container,
    class: className,
    children,
    ...contentProps
  }: HoverCardContentProps = $props();

  // Registered with the Root during initialisation, as an accessor so a later
  // change to side/align/sideOffset is picked up — see
  // ../Popover/positioning.svelte.ts.
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
  <ArkHoverCard.Positioner class="hover-card__positioner">
    <ArkHoverCard.Content
      class={clsx("hover-card__popup", "text-default-body-medium", className)}
      {...contentProps}
    >
      {@render children?.()}
    </ArkHoverCard.Content>
  </ArkHoverCard.Positioner>
</Portal>
