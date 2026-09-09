<script lang="ts">
  import { Carousel } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Carousel {...(props as any)} />
