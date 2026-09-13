<!--
  Heading for the panel, and the thing that names it.

  Not pinned with `asChild`, unlike the description next to it: Ark renders this
  part as an `<h2>` in 5.24 and in the newer packages alike, so the element is
  already the same in all three libraries.
-->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { SheetTitleProps } from "./Sheet.types.js";

  let { class: className, children, ...rest }: SheetTitleProps = $props();
</script>

<ArkDialog.Title class={clsx("dialog__title", "text-strong-heading-small", className)} {...rest}>
  {@render children?.()}
</ArkDialog.Title>
