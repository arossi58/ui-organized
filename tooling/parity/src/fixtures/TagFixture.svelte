<script lang="ts">
  import { Tag } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Tag {...props}>Label</Tag>
