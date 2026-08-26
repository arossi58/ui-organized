<!--
  Wrap your app once. Trigger toasts imperatively with the manager:

      import { useToastManager } from "@ui-organized/svelte";
      const toast = useToastManager();
      toast.add({ title: "Saved", description: "Your changes are live.", type: "success" });
-->
<script lang="ts">
  import { Toast, Toaster } from "@ark-ui/svelte";
  import { toastStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import { STATUS_ICON, resolveStatus, toaster } from "./toaster.js";
  import type { ToastProviderProps } from "./Toast.types.js";
  import "@ui-organized/core/components/Toast/Toast.css";

  let { children }: ToastProviderProps = $props();
</script>

{@render children?.()}
<Toaster {toaster} class="toast__viewport">
  {#snippet children(toast)}
    {@const status = resolveStatus(toast().type)}
    <Toast.Root class={toastStyles({ status })}>
      <span class="toast__icon">
        <Icon name={STATUS_ICON[status]} size={20} />
      </span>
      <div class="toast__content">
        <Toast.Title class="toast__title text-strong-body-medium">{toast().title}</Toast.Title>
        <Toast.Description class="toast__description text-default-body-medium">
          {toast().description}
        </Toast.Description>
      </div>
      {#if toast().action}
        <Toast.ActionTrigger class="toast__action text-emphasis-body-small">
          {toast().action?.label}
        </Toast.ActionTrigger>
      {/if}
      <Toast.CloseTrigger class="toast__close" aria-label="Dismiss">
        <Icon name="close" size={20} />
      </Toast.CloseTrigger>
    </Toast.Root>
  {/snippet}
</Toaster>
