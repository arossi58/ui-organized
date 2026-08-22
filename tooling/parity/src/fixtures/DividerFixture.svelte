<script lang="ts">
  import { Divider } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Divider {...props} />
