<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import Icon from "../Icon/Icon.svelte";
  import type { ContextMenuCheckboxItemProps } from "./ContextMenu.types.js";

  let {
    value, checked, onCheckedChange, class: className, children, ...rest
  }: ContextMenuCheckboxItemProps = $props();

  const generatedId = $props.id();
</script>

<ArkMenu.CheckboxItem
  value={value ?? generatedId}
  checked={checked ?? false}
  onCheckedChange={(next) => onCheckedChange?.(next)}
  class={clsx("context-menu__item", "context-menu__item--check", className)}
  {...rest}
>
  <!--
    Design-system Checkbox control; checked state is driven by the item's
    data-state (see ContextMenu.css), not by the CheckboxItem indicator. The
    check glyph mirrors the standalone Checkbox — the indicator's visibility is
    toggled in ContextMenu.css.
  -->
  <span class="checkbox__control context-menu__control">
    <span class="checkbox__indicator">
      <Icon name="check" size={16} class="checkbox__check" />
    </span>
  </span>
  <span class="context-menu__item-label">{@render children?.()}</span>
</ArkMenu.CheckboxItem>
