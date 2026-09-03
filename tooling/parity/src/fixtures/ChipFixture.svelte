<script lang="ts">
  import { Chip } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Chip {...props}>Admin</Chip>
