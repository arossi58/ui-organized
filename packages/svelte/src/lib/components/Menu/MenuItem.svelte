<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import Icon from "../Icon/Icon.svelte";
  import type { MenuItemProps } from "./Menu.types.js";

  let {
    icon, destructive, value, onSelect, class: className, children, ...rest
  }: MenuItemProps = $props();

  // Ark requires a stable value per item; fall back to a generated id.
  // Typeahead still uses the item's text content.
  const generatedId = $props.id();
</script>

<ArkMenu.Item
  value={value ?? generatedId}
  {onSelect}
  class={clsx("menu__item", destructive && "menu__item--destructive", className)}
  {...rest}
>
  {#if icon}<Icon name={icon} size={20} class="menu__item-icon" />{/if}
  <span class="menu__item-label">{@render children?.()}</span>
</ArkMenu.Item>
