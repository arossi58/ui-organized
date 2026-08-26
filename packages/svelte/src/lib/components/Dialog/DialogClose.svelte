<!-- Closes the dialog when activated. Pass `asChild` to project a custom element. -->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import type { DialogCloseProps } from "./Dialog.types.js";

  let { asChild: project, children, ...rest }: DialogCloseProps = $props();
</script>

{#if project}
  <ArkDialog.CloseTrigger {...rest}>
    {#snippet asChild(props)}{@render project(props)}{/snippet}
  </ArkDialog.CloseTrigger>
{:else}
  <ArkDialog.CloseTrigger {...rest}>{@render children?.()}</ArkDialog.CloseTrigger>
{/if}
