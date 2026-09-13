<script lang="ts">
  import { Tour } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<Tour {...props} />
