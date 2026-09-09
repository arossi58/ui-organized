<script lang="ts">
  import { Avatar as ArkAvatar } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { avatarStyles, initials } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { AvatarProps } from "./Avatar.types.js";
  import "@ui-organized/core/components/Avatar/Avatar.css";

  const ICON_SIZE: Record<NonNullable<AvatarProps["size"]>, number> = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  };

  let {
    src,
    alt,
    name,
    fallback,
    size = "md",
    shape,
    class: className,
    ...rest
  }: AvatarProps = $props();
</script>

<ArkAvatar.Root class={clsx(avatarStyles({ size, shape }), className)} {...rest}>
  {#if src}
    <ArkAvatar.Image {src} alt={alt ?? name} class="avatar__image" />
  {/if}
  <ArkAvatar.Fallback class="avatar__fallback">
    {#if fallback}
      {@render fallback()}
    {:else if name}
      {initials(name)}
    {:else}
      <Icon name="user" size={ICON_SIZE[size]} />
    {/if}
  </ArkAvatar.Fallback>
</ArkAvatar.Root>
