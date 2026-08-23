<!-- Element that opens the menu. Pass `asChild` to project a custom element. -->
<script lang="ts">
  import { Menu as ArkMenu, useMenuContext } from "@ark-ui/svelte";
  import { popupControls } from "@ui-organized/core";
  import { getInMenubar } from "../Menubar/menubarContext.js";
  import type { MenuTriggerProps } from "./Menu.types.js";

  let { asChild: project, children, ...rest }: MenuTriggerProps = $props();

  const menu = useMenuContext();
  const controls = $derived(popupControls(menu().open));

  // Inside a menubar the trigger is one of the bar's menuitems, not a button —
  // `role="menubar"` admits no other children. The data attribute is how the bar
  // finds its own triggers without catching a portalled menu's items too. Read
  // once at initialisation: a bar does not appear around a mounted trigger.
  const menubar = getInMenubar() ? ({ role: "menuitem", "data-menubar-item": "" } as const) : {};
</script>

{#if project}
  <ArkMenu.Trigger {...controls} {...menubar} {...rest}>
    {#snippet asChild(props)}{@render project(props)}{/snippet}
  </ArkMenu.Trigger>
{:else}
  <ArkMenu.Trigger {...controls} {...menubar} {...rest}>{@render children?.()}</ArkMenu.Trigger>
{/if}
