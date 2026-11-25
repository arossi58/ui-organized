<script lang="ts">
  import { Button, EmptyState } from "@ui-organized/svelte";
  let { withActions = false, title, ...props }: Record<string, any> = $props();
</script>

{#if withActions}
  <EmptyState {title} {...props}>
    {#snippet actions()}<Button>Clear filters</Button>{/snippet}
  </EmptyState>
{:else}
  <EmptyState {title} {...props} />
{/if}
