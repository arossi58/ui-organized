<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import Icon from "../Icon/Icon.svelte";
  import type { ContextMenuItemProps } from "./ContextMenu.types.js";

  let {
    icon, destructive, value, onSelect, class: className, children, ...rest
  }: ContextMenuItemProps = $props();

  // Ark requires a stable value per item; fall back to a generated id.
  // Typeahead still uses the item's text content.
  const generatedId = $props.id();
</script>

<ArkMenu.Item
  value={value ?? generatedId}
  {onSelect}
  class={clsx("context-menu__item", destructive && "context-menu__item--destructive", className)}
  {...rest}
>
  {#if icon}<Icon name={icon} size={20} class="context-menu__item-icon" />{/if}
  <span class="context-menu__item-label">{@render children?.()}</span>
</ArkMenu.Item>
