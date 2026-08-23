<script lang="ts">
  import { Editable } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<Editable {...props} />
