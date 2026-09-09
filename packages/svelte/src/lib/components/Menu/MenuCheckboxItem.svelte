<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import Icon from "../Icon/Icon.svelte";
  import type { MenuCheckboxItemProps } from "./Menu.types.js";

  let {
    value, checked, onCheckedChange, class: className, children, ...rest
  }: MenuCheckboxItemProps = $props();

  const generatedId = $props.id();
</script>

<ArkMenu.CheckboxItem
  value={value ?? generatedId}
  checked={checked ?? false}
  onCheckedChange={(next) => onCheckedChange?.(next)}
  class={clsx("menu__item", "menu__item--check", className)}
  {...rest}
>
  <!--
    Design-system Checkbox control; checked state is driven by the item's
    data-state (see Menu.css), not by the CheckboxItem indicator. The check glyph
    mirrors the standalone Checkbox — the indicator's visibility is toggled in
    Menu.css.
  -->
  <span class="checkbox__control menu__control">
    <span class="checkbox__indicator">
      <Icon name="check" size={16} class="checkbox__check" />
    </span>
  </span>
  <span class="menu__item-label">{@render children?.()}</span>
</ArkMenu.CheckboxItem>
