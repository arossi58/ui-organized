<script lang="ts">
  import { Accordion } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<Accordion {...(props as any)} />
