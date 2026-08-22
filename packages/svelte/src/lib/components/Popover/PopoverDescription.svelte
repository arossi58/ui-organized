<!-- Supporting copy under the title; becomes the popover's description. -->
<script lang="ts">
  import { Popover as ArkPopover } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import type { PopoverDescriptionProps } from "./Popover.types.js";

  let { class: className, children, ...rest }: PopoverDescriptionProps = $props();
</script>

<ArkPopover.Description
  class={clsx("popover__description", "text-default-body-medium", className)}
  {...rest}
>
  {@render children?.()}
</ArkPopover.Description>
