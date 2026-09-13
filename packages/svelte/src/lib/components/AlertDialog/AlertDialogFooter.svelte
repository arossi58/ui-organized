<!-- Right-aligned action row, typically holding Cancel + Confirm. -->
<script lang="ts">
  import { clsx } from "clsx";
  import type { AlertDialogFooterProps } from "./AlertDialog.types.js";

  let { class: className, children, ...rest }: AlertDialogFooterProps = $props();
</script>

<div class={clsx("dialog__footer", className)} {...rest}>{@render children?.()}</div>
