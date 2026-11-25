<script lang="ts">
  import { Spinner } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Spinner {...props} />
