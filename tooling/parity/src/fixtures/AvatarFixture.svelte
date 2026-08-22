<script lang="ts">
  import { Avatar } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Avatar {...props} />
