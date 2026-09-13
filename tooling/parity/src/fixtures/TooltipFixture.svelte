<script lang="ts">
  import { Tooltip } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<Tooltip {...props}>
  {#snippet children()}Hover me{/snippet}
</Tooltip>
