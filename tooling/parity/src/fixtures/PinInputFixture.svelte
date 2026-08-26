<script lang="ts">
  import { PinInput } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<PinInput {...props} />
