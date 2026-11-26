<!-- Rows that belong together, as a list: each Item inside is one of its list items. -->
<script lang="ts">
  import { setContext } from "svelte";
  import { clsx } from "clsx";
  import { itemGroupStyles } from "@ui-organized/core";
  import { ITEM_GROUP_KEY } from "./context.js";
  import type { ItemGroupProps } from "./Item.types.js";
  import "@ui-organized/core/components/Item/Item.css";

  let { variant = "plain", divided = true, class: className, children, ...rest }: ItemGroupProps = $props();

  setContext(ITEM_GROUP_KEY, true);
</script>

<div role="list" class={clsx(itemGroupStyles({ variant, divided }), className)} {...rest}>
  {@render children?.()}
</div>
