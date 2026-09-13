<!-- Button that toggles the panel. Pass `asChild` to project a custom element. -->
<script lang="ts">
  import { Collapsible as ArkCollapsible } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { CollapsibleTriggerProps } from "./Collapsible.types.js";

  let {
    asChild: project,
    class: className,
    children,
    ...rest
  }: CollapsibleTriggerProps = $props();

  const triggerClass = $derived(
    clsx("collapsible__trigger", "text-emphasis-body-large", className),
  );
</script>

{#if project}
  <ArkCollapsible.Trigger class={triggerClass} {...rest}>
    {#snippet asChild(props)}{@render project(props)}{/snippet}
  </ArkCollapsible.Trigger>
{:else}
  <ArkCollapsible.Trigger class={triggerClass} {...rest}>
    {@render children?.()}
  </ArkCollapsible.Trigger>
{/if}
