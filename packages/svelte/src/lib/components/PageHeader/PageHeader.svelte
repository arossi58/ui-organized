<!--
  The top of a page: a breadcrumb trail, the title and description, the
  page's actions, and an optional row of tabs. React's PageHeader renders the
  same markup.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { PAGE_HEADER_TEXT_CLASS, pageHeaderStyles } from "@ui-organized/core";
  import type { PageHeaderProps } from "./PageHeader.types.js";
  import "@ui-organized/core/components/PageHeader/PageHeader.css";

  let {
    title,
    description,
    breadcrumbs,
    actions,
    tabs,
    size = "md",
    headingLevel = 1,
    divided,
    class: className,
    ...rest
  }: PageHeaderProps = $props();

  const text = $derived(PAGE_HEADER_TEXT_CLASS[size]);
</script>

<div class={clsx(pageHeaderStyles({ size, divided, tabs: !!tabs }), className)} {...rest}>
  {#if breadcrumbs}<div class="page-header__breadcrumbs">{@render breadcrumbs()}</div>{/if}
  <div class="page-header__row">
    <div class="page-header__heading">
      <svelte:element this={`h${headingLevel}`} class={clsx("page-header__title", text.title)}>{title}</svelte:element>
      {#if description}<p class={clsx("page-header__description", text.description)}>{description}</p>{/if}
    </div>
    {#if actions}<div class="page-header__actions">{@render actions()}</div>{/if}
  </div>
  {#if tabs}<div class="page-header__tabs">{@render tabs()}</div>{/if}
</div>
