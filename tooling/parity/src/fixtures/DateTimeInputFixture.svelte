<script lang="ts">
  import { DateTimeInput } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<DateTimeInput {...props} />
