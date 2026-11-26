<!-- A section's title row, one level down from PageHeader. React's SectionHeader renders the same markup. -->
<script lang="ts">
  import { clsx } from "clsx";
  import { SECTION_HEADER_TEXT_CLASS, sectionHeaderStyles } from "@ui-organized/core";
  import type { SectionHeaderProps } from "./PageHeader.types.js";
  import "@ui-organized/core/components/PageHeader/PageHeader.css";

  let {
    title,
    description,
    actions,
    size = "md",
    align = "start",
    headingLevel = 2,
    divided,
    class: className,
    ...rest
  }: SectionHeaderProps = $props();

  const text = $derived(SECTION_HEADER_TEXT_CLASS[size]);
</script>

<div class={clsx(sectionHeaderStyles({ size, align, divided }), className)} {...rest}>
  <div class="section-header__heading">
    <svelte:element this={`h${headingLevel}`} class={clsx("section-header__title", text.title)}>{title}</svelte:element>
    {#if description}<p class={clsx("section-header__description", text.description)}>{description}</p>{/if}
  </div>
  {#if actions}<div class="section-header__actions">{@render actions()}</div>{/if}
</div>
