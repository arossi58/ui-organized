<!-- Popover root — controls open state. Wrap a trigger and content. -->
<script lang="ts">
  import { Popover as ArkPopover } from "@ark-ui/svelte";
  import { providePositioning } from "./positioning.svelte.js";
  import type { PopoverProps } from "./Popover.types.js";
  import "@ui-organized/core/components/Popover/Popover.css";

  let {
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    modal,
    children,
  }: PopoverProps = $props();

  // The Content writes its side/align into this during its own initialisation.
  const positioning = providePositioning({ placement: "bottom", gutter: 8 });
</script>

<ArkPopover.Root
  bind:open
  {defaultOpen}
  onOpenChange={(details) => {
    open = details.open;
    onOpenChange?.(details.open);
  }}
  {modal}
  positioning={positioning.read()}
>
  {@render children?.()}
</ArkPopover.Root>
