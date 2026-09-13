<!-- Portalled backdrop + centered popup holding the dialog body. -->
<script lang="ts">
  import { Dialog as ArkDialog, Portal } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { dialogStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { DialogContentProps } from "./Dialog.types.js";

  let {
    size,
    showClose = true,
    container,
    class: className,
    children,
    ...contentProps
  }: DialogContentProps = $props();
</script>

<!-- Ark centres the content with a Positioner rather than the popup centring itself. -->
<Portal container={container ?? undefined}>
  <ArkDialog.Backdrop class="dialog__backdrop" />
  <ArkDialog.Positioner class="dialog__positioner">
    <ArkDialog.Content class={clsx(dialogStyles({ size }), className)} {...contentProps}>
      {#if showClose}
        <ArkDialog.CloseTrigger class="dialog__close" aria-label="Close">
          <Icon name="close" size={20} />
        </ArkDialog.CloseTrigger>
      {/if}
      {@render children?.()}
    </ArkDialog.Content>
  </ArkDialog.Positioner>
</Portal>
