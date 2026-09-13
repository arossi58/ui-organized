<!--
  A trail of links showing the current page's location in a hierarchy.

  No Ark machine behind it — Ark UI has no Breadcrumb primitive — so the markup
  here is the contract, compared element for element against the React library by
  the parity gate.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import Icon from "../Icon/Icon.svelte";
  import type { BreadcrumbItem, BreadcrumbProps } from "./Breadcrumb.types.js";
  import "@ui-organized/core/components/Breadcrumb/Breadcrumb.css";

  const ICON_SIZE = 16;

  let { items, separator, class: className, ...rest }: BreadcrumbProps = $props();

  const isLast = (index: number) => index === items.length - 1;
</script>

{#snippet crumb(item: BreadcrumbItem)}
  {#if item.icon}
    <Icon name={item.icon} size={ICON_SIZE} class="breadcrumb__icon" />
  {/if}
  {#if typeof item.label === "string"}{item.label}{:else}{@render item.label()}{/if}
{/snippet}

<nav
  aria-label="Breadcrumb"
  class={clsx("breadcrumb", "text-default-body-medium", className)}
  {...rest}
>
  <ol class="breadcrumb__list">
    {#each items as item, index (index)}
      <li class="breadcrumb__item">
        {#if item.href && !isLast(index)}
          <a href={item.href} class="breadcrumb__link">{@render crumb(item)}</a>
        {:else}
          <!--
            The last crumb is the current page even when it carries an href, so it
            renders as text rather than as a link nobody would follow.
          -->
          <span class="breadcrumb__current" aria-current={isLast(index) ? "page" : undefined}>
            {@render crumb(item)}
          </span>
        {/if}
        {#if !isLast(index)}
          <span class="breadcrumb__separator" aria-hidden="true">
            {#if separator == null}
              <Icon name="chevron-right" size={ICON_SIZE} />
            {:else if typeof separator === "string"}{separator}{:else}{@render separator()}{/if}
          </span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
