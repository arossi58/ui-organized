<script lang="ts">
  import { Listbox } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<Listbox {...props} />
