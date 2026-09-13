<!-- HoverCard root — opens a rich preview when the trigger is hovered or focused. -->
<script lang="ts">
  import { HoverCard as ArkHoverCard } from "@ark-ui/svelte";
  import { providePositioning } from "../Popover/positioning.svelte.js";
  import type { HoverCardProps } from "./HoverCard.types.js";
  import "@ui-organized/core/components/HoverCard/HoverCard.css";

  let {
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    openDelay,
    closeDelay,
    children,
  }: HoverCardProps = $props();

  // The Content writes its side/align into this during its own initialisation.
  const positioning = providePositioning({ placement: "bottom", gutter: 8 });
</script>

<ArkHoverCard.Root
  bind:open
  {defaultOpen}
  onOpenChange={(details) => {
    open = details.open;
    onOpenChange?.(details.open);
  }}
  {openDelay}
  {closeDelay}
  positioning={positioning.read()}
>
  {@render children?.()}
</ArkHoverCard.Root>
