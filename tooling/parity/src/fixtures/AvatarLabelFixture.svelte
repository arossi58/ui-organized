<script lang="ts">
  import { AvatarLabel } from "@ui-organized/svelte";
  let { name, ...props }: Record<string, any> = $props();
</script>

<AvatarLabel {name} {...props} />
