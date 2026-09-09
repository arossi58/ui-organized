<script lang="ts">
  import { SearchInput } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<SearchInput {...props} />
