<!-- Optional wrapper to visually cluster a subset of toolbar controls. -->
<script lang="ts">
  import { clsx } from "clsx";
  import type { ToolbarGroupProps } from "./Toolbar.types.js";

  let { class: className, children, ...rest }: ToolbarGroupProps = $props();
</script>

<div role="group" class={clsx("toolbar__group", className)} {...rest}>
  {@render children?.()}
</div>
