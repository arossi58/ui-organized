<!-- Sheet root — an edge-anchored panel built on the Dialog primitive. -->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import type { SheetProps } from "./Sheet.types.js";
  // Reuses the Dialog chrome (backdrop, title/description/footer/close).
  import "@ui-organized/core/components/Dialog/Dialog.css";
  import "@ui-organized/core/components/Sheet/Sheet.css";

  let { open = $bindable(), defaultOpen, onOpenChange, modal, children }: SheetProps = $props();
</script>

<ArkDialog.Root
  bind:open
  {defaultOpen}
  onOpenChange={(details) => {
    open = details.open;
    onOpenChange?.(details.open);
  }}
  {modal}
>
  {@render children?.()}
</ArkDialog.Root>
