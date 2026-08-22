<script lang="ts">
  import { clsx } from "clsx";
  import { tagStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { TagProps } from "./Tag.types.js";
  import "@ui-organized/core/components/Tag/Tag.css";

  /** Icons render at 16px across every tag size. */
  const ICON_SIZE = 16;

  let {
    variant,
    size,
    emphasized = true,
    icon,
    iconPosition = "left",
    class: className,
    children,
    ...rest
  }: TagProps = $props();
</script>

<span
  class={clsx(tagStyles({ variant, size }), !emphasized && "tag--subdued", className)}
  {...rest}
>
  {#if icon && iconPosition === "left"}
    <Icon name={icon} size={ICON_SIZE} class="tag__icon" />
  {/if}
  <span class="tag__label">{@render children?.()}</span>
  {#if icon && iconPosition === "right"}
    <Icon name={icon} size={ICON_SIZE} class="tag__icon" />
  {/if}
</span>
