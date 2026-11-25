<script lang="ts">
  import { clsx } from "clsx";
  import { resolveTagAppearance, tagStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import { glyph } from "../../icons/glyph.js";
  import type { TagProps } from "./Tag.types.js";
  import "@ui-organized/core/components/Tag/Tag.css";

  /** Icons render at 16px across every tag size. */
  const ICON_SIZE = 16;
  /** The remove glyph is smaller than a content icon, so it reads as a control beside the label. */
  const REMOVE_ICON_SIZE = 12;

  let {
    variant,
    size,
    appearance,
    emphasized = true,
    shape,
    dot = false,
    icon,
    iconPosition = "left",
    onremove,
    removeLabel,
    class: className,
    children,
    ...rest
  }: TagProps = $props();
</script>

<span
  class={clsx(tagStyles({ variant, size, appearance: resolveTagAppearance(appearance, emphasized), shape }), className)}
  {...rest}
>
  {#if dot}<span class="tag__dot" aria-hidden="true"></span>{/if}
  {#if icon && iconPosition === "left"}
    <Icon name={icon} size={ICON_SIZE} class="tag__icon" />
  {/if}
  <span class="tag__label">{@render children?.()}</span>
  {#if icon && iconPosition === "right"}
    <Icon name={icon} size={ICON_SIZE} class="tag__icon" />
  {/if}
  {#if onremove}
    <button type="button" class="tag__remove" aria-label={removeLabel} onclick={onremove}>
      <Icon name={glyph("close")} size={REMOVE_ICON_SIZE} />
    </button>
  {/if}
</span>
