<!--
  Overlapping avatars for the people on something, with a `+N` for the rest.
  Data-driven, as in every library, because a snippet can't be counted.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { avatarGroupStyles, avatarStyles, defaultAvatarGroupMoreLabel, splitAvatarGroup } from "@ui-organized/core";
  import Avatar from "../Avatar/Avatar.svelte";
  import type { AvatarGroupProps } from "./AvatarGroup.types.js";
  import "@ui-organized/core/components/AvatarGroup/AvatarGroup.css";

  let {
    items,
    max,
    size = "md",
    shape,
    label,
    moreLabel = defaultAvatarGroupMoreLabel,
    class: className,
    ...rest
  }: AvatarGroupProps = $props();

  const split = $derived(splitAvatarGroup(items, max));
</script>

<div class={clsx(avatarGroupStyles({ size }), className)} role="group" aria-label={label} {...rest}>
  {#each split.shown as item, index (item.name ?? index)}
    {#snippet text()}{item.fallback}{/snippet}
    <Avatar {size} {shape} src={item.src} name={item.name} alt={item.alt} fallback={item.fallback ? text : undefined} />
  {/each}
  {#if split.overflow > 0}
    <span
      class={clsx(avatarStyles({ size, shape }), "avatar-group__overflow")}
      role="img"
      aria-label={moreLabel(split.overflow)}>{`+${split.overflow}`}</span
    >
  {/if}
</div>
