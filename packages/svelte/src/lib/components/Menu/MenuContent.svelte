<!-- Portalled, positioned surface holding the menu items. -->
<script lang="ts">
  import { Menu as ArkMenu, Portal } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { setAnchoredPositioning, toPlacement } from "../Popover/positioning.svelte.js";
  import type { MenuContentProps } from "./Menu.types.js";

  let {
    side = "bottom",
    align = "start",
    sideOffset = 4,
    alignOffset,
    container,
    class: className,
    children,
    ...contentProps
  }: MenuContentProps = $props();

  setAnchoredPositioning(() => ({
    placement: toPlacement(side, align),
    gutter: sideOffset,
    offset: alignOffset != null ? { crossAxis: alignOffset } : undefined,
  }));
</script>

<Portal container={container ?? undefined}>
  <ArkMenu.Positioner class="menu__positioner">
    <ArkMenu.Content class={clsx("menu__popup", className)} {...contentProps}>
      {@render children?.()}
    </ArkMenu.Content>
  </ArkMenu.Positioner>
</Portal>
