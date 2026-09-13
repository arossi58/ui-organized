<script lang="ts">
  import { TextArea } from "@ui-organized/svelte";
  let { ...props }: Record<string, unknown> = $props();
</script>

<TextArea {...(props as any)} />
