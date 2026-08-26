<!-- Supporting copy under the title; becomes the popover's description.

  ── Why the element is pinned ───────────────────────────────────────────────

  `@ark-ui/svelte` is on 5.24 while React and Vue are on 5.39, and Ark changed
  its default elements in between: this part renders a `<p>` in 5.24 and a `<div>`
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
  import type { PopoverDescriptionProps } from "./Popover.types.js";

  let { class: className, children, ...rest }: PopoverDescriptionProps = $props();
</script>

<ArkPopover.Description {...rest}>
  {#snippet asChild(project)}
    <div {...project()} class={clsx("popover__description", "text-default-body-medium", className)}>
      {@render children?.()}
    </div>
  {/snippet}
</ArkPopover.Description>
