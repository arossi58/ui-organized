<!-- Closes the popover when activated. Pass `asChild` to project a custom element. -->
<script lang="ts">
  import { Popover as ArkPopover } from "@ark-ui/svelte";
  import type { PopoverCloseProps } from "./Popover.types.js";

  let { asChild: project, children, ...rest }: PopoverCloseProps = $props();
</script>

{#if project}
  <ArkPopover.CloseTrigger {...rest}>
    {#snippet asChild(props)}
      {@render project(props)}
    {/snippet}
  </ArkPopover.CloseTrigger>
{:else}
  <ArkPopover.CloseTrigger {...rest}>
    {@render children?.()}
  </ArkPopover.CloseTrigger>
{/if}
