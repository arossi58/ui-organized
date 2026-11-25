<script lang="ts">
  import { Attachment } from "@ui-organized/svelte";
  // `removable` / `retryable` stand for the handlers; see cases/Attachment.tsx.
  let { removable = false, retryable = false, ...props }: Record<string, any> = $props();
  const noop = () => {};
</script>

<Attachment {...(props as any)} onRemove={removable ? noop : undefined} onRetry={retryable ? noop : undefined} />
