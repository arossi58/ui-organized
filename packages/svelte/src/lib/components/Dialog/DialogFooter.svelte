<!-- Right-aligned action row, typically holding the dialog's buttons. -->
<script lang="ts">
  import { clsx } from "clsx";
  import type { DialogFooterProps } from "./Dialog.types.js";

  let { class: className, children, ...rest }: DialogFooterProps = $props();
</script>

<div class={clsx("dialog__footer", className)} {...rest}>{@render children?.()}</div>
