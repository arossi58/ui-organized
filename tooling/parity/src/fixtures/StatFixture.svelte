<script lang="ts">
  import { Stat } from "@ui-organized/svelte";
  // `chart` stands for the chart snippet; see cases/Stat.tsx.
  let { chart, ...props }: Record<string, any> = $props();
</script>

{#snippet chartSnippet()}<span class="parity-chart">Chart</span>{/snippet}

<Stat {...(props as any)} chart={chart ? chartSnippet : undefined} />
