<script lang="ts">
  import { DateInput } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<DateInput {...props} />
