<!-- Element that opens the dialog. Pass `asChild` to project a custom element. -->
<script lang="ts">
  import { Dialog as ArkDialog, useDialogContext } from "@ark-ui/svelte";
  import { popupControls } from "@ui-organized/core";
  import type { AlertDialogTriggerProps } from "./AlertDialog.types.js";

  let { asChild: project, children, ...rest }: AlertDialogTriggerProps = $props();

  const dialog = useDialogContext();
  // The content it names is only mounted while open; popupControls drops the
  // reference the rest of the time so it cannot dangle.
  const controls = $derived(popupControls(dialog().open));
</script>

{#if project}
  <ArkDialog.Trigger {...controls} {...rest}>
    {#snippet asChild(props)}{@render project(props)}{/snippet}
  </ArkDialog.Trigger>
{:else}
  <ArkDialog.Trigger {...controls} {...rest}>{@render children?.()}</ArkDialog.Trigger>
{/if}
