<!-- The root: size, variant, and the element every part measures itself against. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { clsx } from "clsx";
  import { getRootProps } from "@ui-organized/table-core";
  import { getTable } from "../../core/tableContext.js";
  import { elementRef } from "../../core/elementRef.js";
  import { svelteProps } from "../../core/props.js";

  let { class: className, children }: { class?: string; children?: Snippet } = $props();
  const table = getTable();
  const root = $derived(getRootProps(table.chrome));
</script>

<div {...svelteProps(root)} class={clsx(root.className, className)} use:elementRef={table.rootRef}>
  {@render children?.()}
</div>
