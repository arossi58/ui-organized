<script lang="ts">
  import { Combobox } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<Combobox {...props} />
