<script lang="ts">
  import { SectionHeader } from "@ui-organized/svelte";
  // `withActions` stands for the slot; see cases/SectionHeader.tsx.
  let { withActions, ...props }: Record<string, any> = $props();
</script>

{#snippet actions()}<button type="button">View all</button>{/snippet}

<SectionHeader {...(props as any)} actions={withActions ? actions : undefined} />
