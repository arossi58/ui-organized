<!--
  Portalled backdrop + edge-anchored panel holding the sheet body. The panel
  self-positions at the edge, so the positioner is just the Ark wrapper.
-->
<script lang="ts">
  import { Dialog as ArkDialog, Portal } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { sheetStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { SheetContentProps } from "./Sheet.types.js";

  // `side` and `size` are left undefined rather than given defaults here: the
  // recipe already declares 'right' and 'md', and repeating them would be a
  // second copy of the default to keep in step.
  let {
    side,
    size,
    showClose = true,
    container,
    class: className,
    children,
    ...contentProps
  }: SheetContentProps = $props();
</script>

<Portal container={container ?? undefined}>
  <ArkDialog.Backdrop class="dialog__backdrop" />
  <ArkDialog.Positioner class="dialog__positioner sheet__positioner">
    <ArkDialog.Content class={clsx(sheetStyles({ side, size }), className)} {...contentProps}>
      {#if showClose}
        <ArkDialog.CloseTrigger class="dialog__close" aria-label="Close">
          <Icon name="close" size={20} />
        </ArkDialog.CloseTrigger>
      {/if}
      {@render children?.()}
    </ArkDialog.Content>
  </ArkDialog.Positioner>
</Portal>
