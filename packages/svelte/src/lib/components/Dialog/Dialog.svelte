<!-- Dialog root — controls open state. -->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import type { DialogProps } from "./Dialog.types.js";
  import "@ui-organized/core/components/Dialog/Dialog.css";

  let { open = $bindable(), defaultOpen, onOpenChange, modal, children }: DialogProps = $props();
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
