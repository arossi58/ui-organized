<!--
  The element that reveals the card on hover/focus. Pass `asChild` to project a
  custom element, which is what a link-shaped trigger wants.

  No `popupControls` here, unlike Popover and Menu: zag's hover-card trigger
  carries no `aria-controls` to begin with, so there is no dangling reference to
  drop while the card is closed.
-->
<script lang="ts">
  import { HoverCard as ArkHoverCard } from "@ark-ui/svelte";
  import type { HoverCardTriggerProps } from "./HoverCard.types.js";

  let { asChild: project, children, ...rest }: HoverCardTriggerProps = $props();
</script>

{#if project}
  <ArkHoverCard.Trigger {...rest}>
    {#snippet asChild(props)}{@render project(props)}{/snippet}
  </ArkHoverCard.Trigger>
{:else}
  <ArkHoverCard.Trigger {...rest}>{@render children?.()}</ArkHoverCard.Trigger>
{/if}
