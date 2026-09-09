<script lang="ts">
  import { Clipboard } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<Clipboard {...props} />
