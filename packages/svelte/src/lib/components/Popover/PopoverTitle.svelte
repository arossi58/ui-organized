<!--
  Heading for the popover, and the thing that names it.

  Ark gives the content `role="dialog"`, which needs an accessible name; it
  points at this part when one is rendered. A popover with neither a title nor an
  `aria-label` on its content reaches a screen reader as an unnamed dialog.
-->
<script lang="ts">
  import { Popover as ArkPopover } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { PopoverTitleProps } from "./Popover.types.js";

  let { class: className, children, ...rest }: PopoverTitleProps = $props();
</script>

<ArkPopover.Title class={clsx("popover__title", "text-strong-body-large", className)} {...rest}>
  {@render children?.()}
</ArkPopover.Title>
