<!-- Closes the drawer when activated. Pass `asChild` to project a custom element. -->
<script lang="ts">
  import { Drawer as ArkDrawer } from "@ark-ui/svelte";
  import type { DrawerCloseProps } from "./Drawer.types.js";

  let { asChild: project, children, ...rest }: DrawerCloseProps = $props();
</script>

{#if project}
  <ArkDrawer.CloseTrigger {...rest}>
    {#snippet asChild(props)}{@render project(props)}{/snippet}
  </ArkDrawer.CloseTrigger>
{:else}
  <ArkDrawer.CloseTrigger type="button" {...rest}>{@render children?.()}</ArkDrawer.CloseTrigger>
{/if}
