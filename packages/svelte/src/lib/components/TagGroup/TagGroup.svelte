<!--
  The announcement pill: a short tag and a message in one pill, "New ▸ We've
  shipped dark mode". With `href` the whole pill is one link.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import {
    TAG_GROUP_ICON_SIZE,
    TAG_GROUP_TAG_SIZE,
    TAG_GROUP_TEXT_CLASS,
    tagGroupStyles,
  } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import Tag from "../Tag/Tag.svelte";
  import { glyph } from "../../icons/glyph.js";
  import type { TagGroupProps } from "./TagGroup.types.js";
  import "@ui-organized/core/components/TagGroup/TagGroup.css";

  let {
    tag,
    variant = "brand",
    size = "md",
    tagPosition = "leading",
    href,
    target,
    rel,
    icon,
    class: className,
    children,
    ...rest
  }: TagGroupProps = $props();

  const trailingIcon = $derived(icon ?? (href !== undefined ? glyph("chevron-right") : undefined));
  const classes = $derived(clsx(tagGroupStyles({ variant, size, tagPosition }), className));
</script>

{#snippet inner()}
  <Tag {variant} size={TAG_GROUP_TAG_SIZE[size]} shape="pill" class="tag-group__tag">{tag}</Tag>
{/snippet}

<svelte:element this={href !== undefined ? "a" : "span"} class={classes} {href} {target} {rel} {...rest}>
  {#if tagPosition === "leading"}{@render inner()}{/if}
  <span class={clsx("tag-group__message", TAG_GROUP_TEXT_CLASS[size])}>{@render children?.()}</span>
  {#if tagPosition === "trailing"}{@render inner()}{/if}
  {#if trailingIcon}<Icon name={trailingIcon} size={TAG_GROUP_ICON_SIZE[size]} class="tag-group__icon" />{/if}
</svelte:element>
