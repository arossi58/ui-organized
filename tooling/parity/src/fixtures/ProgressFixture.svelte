<script lang="ts">
  import { Progress } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Progress {...(props as any)} />
