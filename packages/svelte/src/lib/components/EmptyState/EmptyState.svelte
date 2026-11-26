<!--
  What to show when there is nothing to show: an icon or illustration, a title,
  a line of description and the actions that get the reader out of it.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { EMPTY_STATE_ICON_SIZE, EMPTY_STATE_TEXT_CLASS, emptyStateStyles } from "@ui-organized/core";
  import FeaturedIcon from "../FeaturedIcon/FeaturedIcon.svelte";
  import type { EmptyStateProps } from "./EmptyState.types.js";
  import "@ui-organized/core/components/EmptyState/EmptyState.css";

  let {
    title,
    description,
    icon,
    media,
    actions,
    size = "md",
    headingLevel,
    class: className,
    ...rest
  }: EmptyStateProps = $props();

  const text = $derived(EMPTY_STATE_TEXT_CLASS[size]);
  const titleTag = $derived(headingLevel ? `h${headingLevel}` : "p");
</script>

<div class={clsx(emptyStateStyles({ size }), className)} {...rest}>
  {#if media}
    <div class="empty-state__media">{@render media()}</div>
  {:else if icon}
    <div class="empty-state__media">
      <FeaturedIcon {icon} variant="neutral" size={EMPTY_STATE_ICON_SIZE[size]} />
    </div>
  {/if}
  <div class="empty-state__body">
    <svelte:element this={titleTag} class={clsx("empty-state__title", text.title)}>{title}</svelte:element>
    {#if description}
      <p class={clsx("empty-state__description", text.description)}>{description}</p>
    {/if}
  </div>
  {#if actions}
    <div class="empty-state__actions">{@render actions()}</div>
  {/if}
</div>
