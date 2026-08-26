<script lang="ts">
  import { TreeView } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<TreeView {...(props as any)} />
