<!-- Portalled surface, positioned at the cursor, holding the menu items. -->
<script lang="ts">
  import { Menu as ArkMenu, Portal } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { setAnchoredPositioning } from "../Popover/positioning.svelte.js";
  import type { ContextMenuContentProps } from "./ContextMenu.types.js";

  let {
    sideOffset = 4,
    alignOffset,
    container,
    class: className,
    children,
    ...contentProps
  }: ContextMenuContentProps = $props();

  // An accessor, not a value, so a later change to sideOffset reaches the Root —
  // see ../Popover/positioning.svelte.ts. No placement: the cursor anchor set by
  // ContextTrigger drives it.
  setAnchoredPositioning(() => ({
    gutter: sideOffset,
    offset: alignOffset != null ? { crossAxis: alignOffset } : undefined,
  }));
</script>

<Portal container={container ?? undefined}>
  <ArkMenu.Positioner class="context-menu__positioner">
    <ArkMenu.Content class={clsx("context-menu__popup", className)} {...contentProps}>
      {@render children?.()}
    </ArkMenu.Content>
  </ArkMenu.Positioner>
</Portal>
