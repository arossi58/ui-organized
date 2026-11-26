<script lang="ts">
  import { Kbd } from "@ui-organized/svelte";
  // `text` stands for the children; see cases/Kbd.tsx.
  let { text, ...props }: Record<string, any> = $props();
</script>

{#if text}<Kbd {...(props as any)}>{text}</Kbd>{:else}<Kbd {...(props as any)} />{/if}
