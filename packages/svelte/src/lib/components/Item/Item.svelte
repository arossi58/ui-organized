<!-- A row: media, a title with a line of description, and actions at the end. React's Item renders the same markup. -->
<script lang="ts">
  import { getContext } from "svelte";
  import { clsx } from "clsx";
  import { ITEM_ICON_SIZE, ITEM_TEXT_CLASS, itemStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import { ITEM_GROUP_KEY } from "./context.js";
  import type { ItemProps } from "./Item.types.js";
  import "@ui-organized/core/components/Item/Item.css";

  let {
    title,
    description,
    icon,
    media,
    actions,
    href,
    target,
    rel,
    variant = "plain",
    size = "md",
    headingLevel,
    titleId,
    descriptionId,
    class: className,
    ...rest
  }: ItemProps = $props();

  const inGroup = getContext<boolean | undefined>(ITEM_GROUP_KEY) ?? false;
  const text = $derived(ITEM_TEXT_CLASS[size]);
  const titleTag = $derived(headingLevel ? `h${headingLevel}` : "p");
</script>

<div
  role={inGroup ? "listitem" : undefined}
  class={clsx(itemStyles({ variant, size, link: href != null }), className)}
  {...rest}
>
  {#if media}
    <div class="item__media">{@render media()}</div>
  {:else if icon}
    <div class="item__media item__media--icon"><Icon name={icon} size={ITEM_ICON_SIZE[size]} /></div>
  {/if}
  <div class="item__body">
    <svelte:element this={titleTag} id={titleId} class={clsx("item__title", text.title)}
      >{#if href != null}<a class="item__link" {href} {target} {rel}>{title}</a>{:else}{title}{/if}</svelte:element
    >
    {#if description != null}
      <p id={descriptionId} class={clsx("item__description", text.description)}>{description}</p>
    {/if}
  </div>
  {#if actions}<div class="item__actions">{@render actions()}</div>{/if}
</div>
