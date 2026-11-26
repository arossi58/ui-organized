<!-- Element that opens the drawer. Pass `asChild` to project a custom element. -->
<script lang="ts">
  import { Drawer as ArkDrawer, useDrawerContext } from "@ark-ui/svelte";
  import { popupControls } from "@ui-organized/core";
  import type { DrawerTriggerProps } from "./Drawer.types.js";

  let { asChild: project, children, ...rest }: DrawerTriggerProps = $props();

  const drawer = useDrawerContext();
  // The panel it names is only mounted while open; popupControls drops the
  // reference the rest of the time so it cannot dangle.
  const controls = $derived(popupControls(drawer().open));
</script>

{#if project}
  <ArkDrawer.Trigger {...controls} {...rest}>
    {#snippet asChild(props)}{@render project(props)}{/snippet}
  </ArkDrawer.Trigger>
{:else}
  <ArkDrawer.Trigger {...controls} {...rest}>{@render children?.()}</ArkDrawer.Trigger>
{/if}
