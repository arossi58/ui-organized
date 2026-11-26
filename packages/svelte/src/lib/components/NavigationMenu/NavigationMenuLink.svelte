<!-- A link: a row with an icon and a description in a panel, or a trigger's twin in the bar. -->
<script lang="ts">
  import { getContext } from "svelte";
  // A subpath: Ark Svelte 5.24 ships the component but leaves it out of its main entry.
  import { NavigationMenu as ArkNavigationMenu } from "@ark-ui/svelte/navigation-menu";
  import { clsx } from "clsx";
  import { NAVIGATION_MENU_CLASS, NAVIGATION_MENU_LINK_ICON_SIZE } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import { NAVIGATION_MENU_PANEL_KEY } from "./context.js";
  import type { NavigationMenuLinkProps } from "./NavigationMenu.types.js";

  let {
    current,
    icon,
    description,
    closeOnClick,
    class: className,
    children,
    ...rest
  }: NavigationMenuLinkProps = $props();

  const inPanel = getContext<(() => boolean) | undefined>(NAVIGATION_MENU_PANEL_KEY);
  const panel = $derived(inPanel?.() ?? false);
</script>

<ArkNavigationMenu.Link
  {current}
  {closeOnClick}
  class={clsx(panel ? NAVIGATION_MENU_CLASS.link : NAVIGATION_MENU_CLASS.trigger, className)}
  {...rest}
>
  {#if panel}
    {#if icon != null}
      <span class={NAVIGATION_MENU_CLASS.linkIcon}><Icon name={icon} size={NAVIGATION_MENU_LINK_ICON_SIZE} /></span>
    {/if}
    <span class={NAVIGATION_MENU_CLASS.linkBody}>
      <span class={NAVIGATION_MENU_CLASS.linkTitle}>{@render children?.()}</span>
      {#if description != null}
        <span class={NAVIGATION_MENU_CLASS.linkDescription}>{description}</span>
      {/if}
    </span>
  {:else}
    {@render children?.()}
  {/if}
</ArkNavigationMenu.Link>
