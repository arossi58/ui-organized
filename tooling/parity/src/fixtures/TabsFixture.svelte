<script lang="ts">
  import { Tabs } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Tabs {...(props as any)} />
