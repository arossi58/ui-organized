<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { MenuRadioItemProps } from "./Menu.types.js";

  let { class: className, children, ...rest }: MenuRadioItemProps = $props();
</script>

<ArkMenu.RadioItem class={clsx("menu__item", "menu__item--check", className)} {...rest}>
  <!--
    Design-system Radio control; checked state is driven by the item's data-state
    (see Menu.css), not by the RadioItem indicator.
  -->
  <span class="radio-item__control menu__control">
    <span class="radio-item__indicator"></span>
  </span>
  <span class="menu__item-label">{@render children?.()}</span>
</ArkMenu.RadioItem>
