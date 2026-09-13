<script lang="ts">
  import { ToastProvider, useToastManager, type ToastOptions } from "@ui-organized/svelte";

  let { toasts = [] }: { toasts?: ToastOptions[] } = $props();
  const toast = useToastManager();
</script>

<ToastProvider>
  <button id="fire" onclick={() => toasts.forEach((t) => toast.add(t))}>Fire</button>
</ToastProvider>
