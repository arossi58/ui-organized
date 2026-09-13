<script lang="ts">
  import { Checkbox } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Checkbox {...props} />
