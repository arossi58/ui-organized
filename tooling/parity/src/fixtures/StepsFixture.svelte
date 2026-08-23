<script lang="ts">
  import { Steps } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Steps {...(props as any)} />
