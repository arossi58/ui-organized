<!--
  The region revealed when open. Zag animates its height off `--height`, which it
  writes inline on this element — see Collapsible.css for why that has to be a
  keyframe animation rather than a transition.
-->
<script lang="ts">
  import { Collapsible as ArkCollapsible } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { CollapsibleContentProps } from "./Collapsible.types.js";

  let {
    asChild: project,
    class: className,
    children,
    ...rest
  }: CollapsibleContentProps = $props();

  const panelClass = $derived(clsx("collapsible__panel", className));
</script>

{#if project}
  <ArkCollapsible.Content class={panelClass} {...rest}>
    {#snippet asChild(props)}{@render project(props)}{/snippet}
  </ArkCollapsible.Content>
{:else}
  <!--
    The panel itself is the animating box, so it has to keep `overflow: hidden`
    and no padding of its own; the inner element is what carries the spacing.
  -->
  <ArkCollapsible.Content class={panelClass} {...rest}>
    <div class="collapsible__content">{@render children?.()}</div>
  </ArkCollapsible.Content>
{/if}
