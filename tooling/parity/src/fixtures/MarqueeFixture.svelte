<script lang="ts">
  import { Marquee } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Marquee {...(props as any)} />
