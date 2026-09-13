<script lang="ts">
  import { DateRangeInput } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<DateRangeInput {...props} />
