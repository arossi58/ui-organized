<script lang="ts">
  import { SectionFooter } from "@ui-organized/svelte";
  // `text` stands for the status line, `withActions` for the slot; see cases/SectionFooter.tsx.
  let { text, withActions, ...props }: Record<string, any> = $props();
</script>

{#snippet actions()}<button type="button">Next</button>{/snippet}
{#snippet status()}{text}{/snippet}

<SectionFooter {...(props as any)} actions={withActions ? actions : undefined} children={text ? status : undefined} />
