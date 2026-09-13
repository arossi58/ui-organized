<!-- Dismisses the dialog without acting. Styled as a secondary button. -->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { buttonStyles } from "@ui-organized/core";
  import type { AlertDialogCancelProps } from "./AlertDialog.types.js";

  let { class: className, children, ...rest }: AlertDialogCancelProps = $props();
</script>

<ArkDialog.CloseTrigger class={clsx(buttonStyles({ intent: "secondary" }), className)} {...rest}>
  {@render children?.()}
</ArkDialog.CloseTrigger>
