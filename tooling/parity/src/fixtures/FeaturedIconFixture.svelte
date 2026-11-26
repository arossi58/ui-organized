<script lang="ts">
  import { FeaturedIcon } from "@ui-organized/svelte";
  let { icon = "check", ...props }: Record<string, any> = $props();
</script>

<FeaturedIcon {icon} {...props} />
