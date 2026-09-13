<script lang="ts">
  import { Select } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<Select {...props} />
