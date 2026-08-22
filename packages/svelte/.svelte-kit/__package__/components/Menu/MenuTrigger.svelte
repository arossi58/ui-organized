<!-- Element that opens the menu. Pass `asChild` to project a custom element. -->
<script lang="ts">
  import { Menu as ArkMenu, useMenuContext } from "@ark-ui/svelte";
  import { popupControls } from "@ui-organized/core";
  import type { MenuTriggerProps } from "./Menu.types.js";

  let { asChild: project, children, ...rest }: MenuTriggerProps = $props();

  const menu = useMenuContext();
  const controls = $derived(popupControls(menu().open));
</script>

{#if project}
  <ArkMenu.Trigger {...controls} {...rest}>
    {#snippet asChild(props)}{@render project(props)}{/snippet}
  </ArkMenu.Trigger>
{:else}
  <ArkMenu.Trigger {...controls} {...rest}>{@render children?.()}</ArkMenu.Trigger>
{/if}
