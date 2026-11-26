<!-- The action row. Its buttons fill the row, the reachable ones on a phone. -->
<script lang="ts">
  import { clsx } from "clsx";
  import { DRAWER_CLASS } from "@ui-organized/core";
  import type { DrawerFooterProps } from "./Drawer.types.js";

  let { class: className, children, ...rest }: DrawerFooterProps = $props();
</script>

<div class={clsx(DRAWER_CLASS.footer, className)} {...rest}>
  {@render children?.()}
</div>
