<!-- Element that toggles the popover. Pass `asChild` to project a custom element. -->
<script lang="ts">
  import { Popover as ArkPopover, usePopoverContext } from "@ark-ui/svelte";
  import { popupControls } from "@ui-organized/core";
  import type { PopoverTriggerProps } from "./Popover.types.js";

  let { asChild: project, children, ...rest }: PopoverTriggerProps = $props();

  const popover = usePopoverContext();
  // Ark keeps aria-controls on the trigger at all times, but the content it
  // names is only mounted while open, so the reference dangles the rest of the
  // time. popupControls drops it while closed.
  const controls = $derived(popupControls(popover().open));
</script>

{#if project}
  <ArkPopover.Trigger {...controls} {...rest}>
    {#snippet asChild(props)}
      {@render project(props)}
    {/snippet}
  </ArkPopover.Trigger>
{:else}
  <ArkPopover.Trigger {...controls} {...rest}>
    {@render children?.()}
  </ArkPopover.Trigger>
{/if}
