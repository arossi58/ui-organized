<!--
  Action row pinned to the bottom of the panel, holding the sheet's buttons.
  Fills the row on narrow (left/right) sheets, right-aligns on wide ones.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import type { SheetFooterProps } from "./Sheet.types.js";

  let { class: className, children, ...rest }: SheetFooterProps = $props();
</script>

<div class={clsx("dialog__footer", "sheet__footer", className)} {...rest}>
  {@render children?.()}
</div>
