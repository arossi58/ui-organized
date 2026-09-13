<!--
  Heading for the popover, and the thing that names it.

  Ark gives the content `role="dialog"`, which needs an accessible name; it
  points at this part when one is rendered. A popover with neither a title nor an
  `aria-label` on its content reaches a screen reader as an unnamed dialog.

  ── Why the element is pinned ───────────────────────────────────────────────

  `@ark-ui/svelte` is on 5.24 while React and Vue are on 5.39, and Ark changed
  its default elements in between: this part renders an `<h2>` in 5.24 and a `<div>`
  in the newer packages. Both of the older tags carry UA margins that a
  `<div>` does not, so leaving the choice to Ark means this library lays out
  differently from the other two against a stylesheet all three share.

  Pinning it with `asChild` makes the element ours rather than whichever Ark
  version happens to be installed — which is the point, since the packages
  deliberately do not move in lockstep.
-->
<script lang="ts">
  import { Popover as ArkPopover } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { PopoverTitleProps } from "./Popover.types.js";

  let { class: className, children, ...rest }: PopoverTitleProps = $props();
</script>

<ArkPopover.Title {...rest}>
  {#snippet asChild(project)}
    <div {...project()} class={clsx("popover__title", "text-strong-body-large", className)}>
      {@render children?.()}
    </div>
  {/snippet}
</ArkPopover.Title>
