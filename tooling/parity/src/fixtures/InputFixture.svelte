<script lang="ts">
  import { Input } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Input {...props} />
