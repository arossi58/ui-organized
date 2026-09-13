<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { ContextMenuRadioItemProps } from "./ContextMenu.types.js";

  let { class: className, children, ...rest }: ContextMenuRadioItemProps = $props();
</script>

<ArkMenu.RadioItem
  class={clsx("context-menu__item", "context-menu__item--check", className)}
  {...rest}
>
  <!--
    Design-system Radio control; checked state is driven by the item's data-state
    (see ContextMenu.css), not by the RadioItem indicator.
  -->
  <span class="radio-item__control context-menu__control">
    <span class="radio-item__indicator"></span>
  </span>
  <span class="context-menu__item-label">{@render children?.()}</span>
</ArkMenu.RadioItem>
