<!-- A site's top navigation: triggers that each open a panel of links, and links that go straight to a page. -->
<script lang="ts">
  // A subpath: Ark Svelte 5.24 ships the component but leaves it out of its main entry.
  import { NavigationMenu as ArkNavigationMenu } from "@ark-ui/svelte/navigation-menu";
  import { clsx } from "clsx";
  import {
    NAVIGATION_MENU_CLASS,
    NAVIGATION_MENU_CLOSE_DELAY,
    NAVIGATION_MENU_OPEN_DELAY,
  } from "@ui-organized/core";
  import type { NavigationMenuProps } from "./NavigationMenu.types.js";
  import "@ui-organized/core/components/NavigationMenu/NavigationMenu.css";

  let {
    value = $bindable(),
    defaultValue,
    onValueChange,
    openDelay = NAVIGATION_MENU_OPEN_DELAY,
    closeDelay = NAVIGATION_MENU_CLOSE_DELAY,
    class: className,
    children,
    ...rest
  }: NavigationMenuProps = $props();
</script>

<ArkNavigationMenu.Root
  bind:value
  {defaultValue}
  onValueChange={(details) => onValueChange?.(details.value)}
  {openDelay}
  {closeDelay}
  class={clsx(NAVIGATION_MENU_CLASS.root, className)}
  {...rest}
>
  <ArkNavigationMenu.List class={NAVIGATION_MENU_CLASS.list}>{@render children?.()}</ArkNavigationMenu.List>
</ArkNavigationMenu.Root>
