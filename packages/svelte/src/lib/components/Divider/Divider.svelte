<!--
  A thin visual rule for separating content or controls. Renders in
  `surface/overlay-tertiary` to match the design-system Divider used inside
  toolbars and dense layouts. A vertical rule stretches to its flex row via
  `align-self: stretch`.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { dividerStyles } from "@ui-organized/core";
  import type { DividerProps } from "./Divider.types.js";
  import "@ui-organized/core/components/Divider/Divider.css";

  let {
    orientation = "horizontal",
    spacing = "none",
    class: className,
    ...rest
  }: DividerProps = $props();
</script>

<div
  role="separator"
  aria-orientation={orientation}
  class={clsx(dividerStyles({ orientation, spacing }), className)}
  {...rest}
></div>
