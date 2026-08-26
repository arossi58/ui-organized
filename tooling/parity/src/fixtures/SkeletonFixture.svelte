<script lang="ts">
  import { Skeleton } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Skeleton {...props} />
