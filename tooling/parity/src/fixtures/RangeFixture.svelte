<script lang="ts">
  import { Range } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<Range {...props} />
