<!-- One entry in the bar: a trigger and the panel it opens, or with `href` a link straight to that page. -->
<script lang="ts">
  import { setContext } from "svelte";
  // A subpath: Ark Svelte 5.24 ships the component but leaves it out of its main entry.
  import { NavigationMenu as ArkNavigationMenu } from "@ark-ui/svelte/navigation-menu";
  import { clsx } from "clsx";
  import {
    NAVIGATION_MENU_CHEVRON_SIZE,
    NAVIGATION_MENU_CLASS,
    navigationMenuContentStyles,
  } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import { glyph } from "../../icons/glyph.js";
  import { NAVIGATION_MENU_PANEL_KEY } from "./context.js";
  import type { NavigationMenuItemProps } from "./NavigationMenu.types.js";

  let {
    value,
    label,
    href,
    current,
    disabled,
    columns = 1,
    class: className,
    children,
    ...rest
  }: NavigationMenuItemProps = $props();

  // Children are rendered only in the panel when there is one, so the item can answer for them.
  setContext(NAVIGATION_MENU_PANEL_KEY, () => href == null && label != null);
</script>

<ArkNavigationMenu.Item {value} {disabled} class={clsx(NAVIGATION_MENU_CLASS.item, className)} {...rest}>
  {#if href != null}
    <ArkNavigationMenu.Link {href} {current} class={NAVIGATION_MENU_CLASS.trigger}>{label}</ArkNavigationMenu.Link>
  {:else if label != null}
    <ArkNavigationMenu.Trigger class={NAVIGATION_MENU_CLASS.trigger}
      >{label}<Icon
        name={glyph("chevron-down")}
        size={NAVIGATION_MENU_CHEVRON_SIZE}
        class={NAVIGATION_MENU_CLASS.chevron}
      /></ArkNavigationMenu.Trigger
    >
    <ArkNavigationMenu.Content class={navigationMenuContentStyles({ columns })}>
      {@render children?.()}
    </ArkNavigationMenu.Content>
  {:else}
    {@render children?.()}
  {/if}
</ArkNavigationMenu.Item>
