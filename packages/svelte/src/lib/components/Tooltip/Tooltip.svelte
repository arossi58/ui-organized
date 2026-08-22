<!--
  Lightweight tooltip. Wrap a trigger and pass `content`.

  Unlike React, the trigger is always an Ark Trigger element rather than
  sometimes being projected onto the child: `React.isValidElement(children)` has
  no Svelte equivalent, because a snippet is opaque — there is no way to ask
  whether it renders exactly one element. Consumers who need the tooltip's
  behaviour projected onto their own element compose Ark's Trigger directly.
-->
<script lang="ts">
  import { Tooltip as ArkTooltip, Portal } from "@ark-ui/svelte";
  import { getTooltipDelays } from "./delays.svelte.js";
  import { toPlacement } from "../Popover/positioning.svelte.js";
  import type { TooltipProps } from "./Tooltip.types.js";
  import "@ui-organized/core/components/Tooltip/Tooltip.css";

  let {
    content,
    children,
    side = "top",
    align = "center",
    sideOffset = 6,
    delay,
    closeDelay,
    disabled,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    container,
  }: TooltipProps = $props();

  const shared = $derived(getTooltipDelays());
</script>

{#if disabled}
  {@render children()}
{:else}
  <ArkTooltip.Root
    bind:open
    {defaultOpen}
    onOpenChange={(details) => {
      open = details.open;
      onOpenChange?.(details.open);
    }}
    openDelay={delay ?? shared.delay}
    closeDelay={closeDelay ?? shared.closeDelay}
    positioning={{ placement: toPlacement(side, align), gutter: sideOffset }}
  >
    <ArkTooltip.Trigger class="tooltip__trigger">{@render children()}</ArkTooltip.Trigger>
    <Portal container={container ?? undefined}>
      <ArkTooltip.Positioner class="tooltip__positioner">
        <ArkTooltip.Content class="tooltip__popup text-default-body-small">
          {#if typeof content === "string"}{content}{:else}{@render content()}{/if}
        </ArkTooltip.Content>
      </ArkTooltip.Positioner>
    </Portal>
  </ArkTooltip.Root>
{/if}
