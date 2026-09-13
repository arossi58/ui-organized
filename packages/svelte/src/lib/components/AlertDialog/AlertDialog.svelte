<!--
  AlertDialog root — a focus-trapping confirm dialog dismissed via its actions.

  There is no `modal` prop, unlike Dialog: an alert dialog that could be
  dismissed by clicking past it would defeat the point of asking.
-->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import type { AlertDialogProps } from "./AlertDialog.types.js";
  // Reuses the Dialog chrome (backdrop, popup sizing, title/description/footer/close).
  import "@ui-organized/core/components/Dialog/Dialog.css";
  // The Cancel/Confirm actions render the design-system button without going
  // through <Button>, so its rules have to come with this component rather than
  // being left to an app that happens to import Button elsewhere.
  import "@ui-organized/core/components/Button/Button.css";

  let { open = $bindable(), defaultOpen, onOpenChange, children }: AlertDialogProps = $props();
</script>

<!-- role="alertdialog" gives it the alert semantics + no outside-click dismiss. -->
<ArkDialog.Root
  role="alertdialog"
  bind:open
  {defaultOpen}
  onOpenChange={(details) => {
    open = details.open;
    onOpenChange?.(details.open);
  }}
>
  {@render children?.()}
</ArkDialog.Root>
