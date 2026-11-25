<script lang="ts">
  import { Button, Calendar } from "@ui-organized/svelte";
  // `withFooter` stands for the footer snippet; see cases/Calendar.tsx.
  let { withFooter = false, ...props }: Record<string, any> = $props();
</script>

{#snippet footer()}<Button intent="primary" size="sm">Apply</Button>{/snippet}

<Calendar {...(props as any)} footer={withFooter ? footer : undefined} />
