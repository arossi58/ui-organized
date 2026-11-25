<script lang="ts">
  import { VideoEmbed } from "@ui-organized/svelte";
  let { ...props }: Record<string, any> = $props();
</script>

<VideoEmbed {...(props as any)} />
