<script lang="ts">
  import { Divider } from "@ui-organized/svelte";
  // `label` stands for the children; see cases/Divider.tsx.
  let { label, ...props }: Record<string, unknown> = $props();
</script>

{#if label}
  <Divider {...props}>{label}</Divider>
{:else}
  <Divider {...props} />
{/if}
