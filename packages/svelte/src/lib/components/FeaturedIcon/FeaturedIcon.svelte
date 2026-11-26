<!--
  An icon in a tinted shape, the piece empty states, modal headers, feature
  grids and metric cards are built around. Decorative unless given a `label`.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { FEATURED_ICON_GLYPH_SIZE, featuredIconStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { FeaturedIconProps } from "./FeaturedIcon.types.js";
  import "@ui-organized/core/components/FeaturedIcon/FeaturedIcon.css";

  let {
    icon,
    variant = "brand",
    appearance = "subtle",
    shape = "circle",
    size = "md",
    label,
    class: className,
    ...rest
  }: FeaturedIconProps = $props();
</script>

<span
  class={clsx(featuredIconStyles({ variant, appearance, shape, size }), className)}
  role={label ? "img" : undefined}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : "true"}
  {...rest}
>
  <Icon name={icon} size={FEATURED_ICON_GLYPH_SIZE[size]} />
</span>
