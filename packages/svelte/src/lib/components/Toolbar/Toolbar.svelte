<!--
  A container grouping a set of design-system controls.

  Ark UI has no Toolbar primitive and this needs none: it is a pure layout
  container that owns `role="toolbar"` and the surface. Compose it with the
  library's own controls — `Button` (use `intent="ghost"`), `Input`, and
  `Divider` (use `orientation="vertical"`). Match the control `size` across the
  children to size the toolbar.

  `data-orientation` as well as `aria-orientation`, because the stylesheet
  selects on the data attribute to switch the flex direction; dropping it leaves
  a vertical toolbar laid out horizontally with correct ARIA.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import type { ToolbarProps } from "./Toolbar.types.js";
  import "@ui-organized/core/components/Toolbar/Toolbar.css";

  let { orientation = "horizontal", class: className, children, ...rest }: ToolbarProps = $props();
</script>

<div
  role="toolbar"
  aria-orientation={orientation}
  data-orientation={orientation}
  class={clsx("toolbar", className)}
  {...rest}
>
  {@render children?.()}
</div>
