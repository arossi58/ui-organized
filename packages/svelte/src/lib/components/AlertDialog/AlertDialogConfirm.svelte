<!--
  Confirms the action and closes. Pass `onclick` to run the action.

  A CloseTrigger rather than a plain button, so the dialog closes whether or not
  the handler throws — an alert left open over a failed action reads as "nothing
  happened" and invites a second click.
-->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { buttonStyles } from "@ui-organized/core";
  import type { AlertDialogConfirmProps } from "./AlertDialog.types.js";

  let {
    intent = "primary",
    class: className,
    children,
    ...rest
  }: AlertDialogConfirmProps = $props();
</script>

<ArkDialog.CloseTrigger class={clsx(buttonStyles({ intent }), className)} {...rest}>
  {@render children?.()}
</ArkDialog.CloseTrigger>
