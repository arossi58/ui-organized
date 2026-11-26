<script lang="ts">
  import { AvatarGroup } from "@ui-organized/svelte";
  let { items, ...props }: Record<string, any> = $props();
</script>

<AvatarGroup {items} {...props} />
