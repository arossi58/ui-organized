<script lang="ts">
  import { NumberField } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<NumberField {...props} />
