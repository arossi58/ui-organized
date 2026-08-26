<script lang="ts">
  import { DatePicker } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<DatePicker {...props} />
