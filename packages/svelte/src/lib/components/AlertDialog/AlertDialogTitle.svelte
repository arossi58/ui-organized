<!--
  Heading for the alert, and the thing that names it.

  Not pinned with `asChild`, unlike the description next to it: Ark renders this
  part as an `<h2>` in 5.24 and in the newer packages alike, so the element is
  already the same in all three libraries. Pinning it would be a second copy of
  a decision Ark has not changed.
-->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { AlertDialogTitleProps } from "./AlertDialog.types.js";

  let { class: className, children, ...rest }: AlertDialogTitleProps = $props();
</script>

<ArkDialog.Title class={clsx("dialog__title", "text-strong-heading-small", className)} {...rest}>
  {@render children?.()}
</ArkDialog.Title>
