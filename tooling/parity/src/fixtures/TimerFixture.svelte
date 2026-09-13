<script lang="ts">
  import { Timer } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Timer {...(props as any)} />
