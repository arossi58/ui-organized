<script lang="ts">
  import { Accordion as ArkAccordion } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { accordionStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { AccordionProps } from "./Accordion.types.js";
  import "@ui-organized/core/components/Accordion/Accordion.css";

  let {
    items,
    multiple = true,
    value = $bindable(),
    defaultValue,
    onValueChange,
    disabled,
    variant,
    size,
    class: className,
  }: AccordionProps = $props();
</script>

<!--
  `collapsible` is derived rather than exposed: in single mode it keeps the
  behaviour of closing the open item by clicking it again, which zag already
  implies when `multiple` is set.
-->
<ArkAccordion.Root
  {multiple}
  collapsible={!multiple}
  value={value?.map(String)}
  defaultValue={defaultValue?.map(String)}
  onValueChange={(details) => {
    value = details.value;
    onValueChange?.(details.value);
  }}
  {disabled}
  class={clsx(accordionStyles({ variant, size }), className)}
>
  {#each items as item (item.value)}
    <ArkAccordion.Item value={String(item.value)} disabled={item.disabled} class="accordion__item">
      <!--
        Ark has no Header part — wrap the trigger in a heading ourselves so the
        trigger stays inside a heading for assistive tech.
      -->
      <h3 class="accordion__header">
        <ArkAccordion.ItemTrigger class="accordion__trigger">
          <span class="accordion__title">
            {#if typeof item.title === "string"}{item.title}{:else}{@render item.title()}{/if}
          </span>
          <Icon name="chevron-down" size={20} class="accordion__icon" />
        </ArkAccordion.ItemTrigger>
      </h3>
      <ArkAccordion.ItemContent class="accordion__panel text-default-body-medium">
        <div class="accordion__content">
          {#if typeof item.content === "string"}{item.content}{:else}{@render item.content()}{/if}
        </div>
      </ArkAccordion.ItemContent>
    </ArkAccordion.Item>
  {/each}
</ArkAccordion.Root>
