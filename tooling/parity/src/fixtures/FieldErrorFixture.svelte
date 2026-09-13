<script lang="ts">
  import { FieldError } from "@ui-organized/svelte";
  let { message, ...props }: Record<string, unknown> = $props();
</script>

<FieldError {...props} message={message as string} />
