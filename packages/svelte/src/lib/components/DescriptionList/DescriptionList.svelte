<!--
  Terms and their details, such as a record's fields. Pass `items` for plain
  data, or DescriptionListItem children for details with markup. React's
  DescriptionList renders the same markup.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { descriptionListStyles } from "@ui-organized/core";
  import DescriptionListItem from "./DescriptionListItem.svelte";
  import type { DescriptionListProps } from "./DescriptionList.types.js";
  import "@ui-organized/core/components/DescriptionList/DescriptionList.css";

  let {
    items,
    children,
    layout = "inline",
    size = "md",
    divided,
    class: className,
    ...rest
  }: DescriptionListProps = $props();
</script>

<dl class={clsx(descriptionListStyles({ layout, size, divided }), className)} {...rest}>
  {#if items}{#each items as item, i (i)}<DescriptionListItem term={item.term}>{item.details}</DescriptionListItem>{/each}{/if}
  {@render children?.()}
</dl>
