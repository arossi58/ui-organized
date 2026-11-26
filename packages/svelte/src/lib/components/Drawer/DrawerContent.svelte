<!-- Portalled backdrop and the panel along the bottom edge, with its grabber and close button. -->
<script lang="ts">
  import { Drawer as ArkDrawer, Portal } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { DRAWER_CLASS, DRAWER_CLOSE_ICON_SIZE } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { DrawerContentProps } from "./Drawer.types.js";
  import { glyph } from "../../icons/glyph.js";

  let {
    showGrabber = true,
    showClose = true,
    container,
    class: className,
    children,
    ...contentProps
  }: DrawerContentProps = $props();
</script>

<Portal container={container ?? undefined}>
  <ArkDrawer.Backdrop class={DRAWER_CLASS.backdrop} />
  <ArkDrawer.Positioner class={DRAWER_CLASS.positioner}>
    <ArkDrawer.Content class={clsx(DRAWER_CLASS.popup, className)} {...contentProps}>
      {#if showGrabber}
        <ArkDrawer.Grabber class={DRAWER_CLASS.grabber}>
          <ArkDrawer.GrabberIndicator class={DRAWER_CLASS.grabberIndicator} />
        </ArkDrawer.Grabber>
      {/if}
      {#if showClose}
        <ArkDrawer.CloseTrigger type="button" class={DRAWER_CLASS.close} aria-label="Close">
          <Icon name={glyph("close")} size={DRAWER_CLOSE_ICON_SIZE} />
        </ArkDrawer.CloseTrigger>
      {/if}
      {@render children?.()}
    </ArkDrawer.Content>
  </ArkDrawer.Positioner>
</Portal>
