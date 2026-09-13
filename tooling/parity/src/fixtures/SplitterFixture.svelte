<script lang="ts">
  import { Splitter } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Splitter {...(props as any)} />
