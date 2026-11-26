<!--
  An avatar with a name and a line of supporting text beside it. The avatar is
  hidden from assistive technology, because the name says the same thing; a
  status or verified badge is announced after the name instead.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import {
    AVATAR_LABEL_TEXT_CLASS,
    AVATAR_STATUS_LABEL,
    avatarLabelAnnouncement,
    avatarLabelStyles,
  } from "@ui-organized/core";
  import Avatar from "../Avatar/Avatar.svelte";
  import type { AvatarLabelProps } from "./AvatarLabel.types.js";
  import "@ui-organized/core/components/AvatarLabel/AvatarLabel.css";

  let {
    name,
    description,
    src,
    fallback,
    size = "md",
    shape,
    status,
    statusLabel,
    verified = false,
    verifiedLabel,
    class: className,
    ...rest
  }: AvatarLabelProps = $props();

  const text = $derived(AVATAR_LABEL_TEXT_CLASS[size]);
  const announcement = $derived(
    avatarLabelAnnouncement({
      statusLabel: status ? (statusLabel ?? AVATAR_STATUS_LABEL[status]) : undefined,
      verified,
      verifiedLabel,
    }),
  );
</script>

{#snippet fallbackText()}{fallback}{/snippet}

<div class={clsx(avatarLabelStyles({ size }), className)} {...rest}>
  <Avatar
    aria-hidden="true"
    {size}
    {shape}
    {src}
    {name}
    alt=""
    fallback={fallback ? fallbackText : undefined}
    {status}
    {statusLabel}
    {verified}
    {verifiedLabel}
  />
  <div class="avatar-label__text">
    <span class={clsx("avatar-label__name", text.name)}>{name}</span>
    {#if announcement}<span class="avatar-label__sr">{`, ${announcement}`}</span>{/if}
    {#if description}
      <span class={clsx("avatar-label__description", text.description)}>{description}</span>
    {/if}
  </div>
</div>
