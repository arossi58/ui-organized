<!-- Drawer root: a panel along the bottom edge, dismissed by swiping it down. -->
<script lang="ts">
  import { Drawer as ArkDrawer } from "@ark-ui/svelte";
  import type { DrawerProps } from "./Drawer.types.js";
  // Reuses the Dialog chrome (title, description, footer, close).
  import "@ui-organized/core/components/Dialog/Dialog.css";
  import "@ui-organized/core/components/Drawer/Drawer.css";

  let { open = $bindable(), defaultOpen, onOpenChange, modal, children }: DrawerProps = $props();
</script>

<ArkDrawer.Root
  bind:open
  {defaultOpen}
  onOpenChange={(details) => {
    open = details.open;
    onOpenChange?.(details.open);
  }}
  {modal}
>
  {@render children?.()}
</ArkDrawer.Root>
