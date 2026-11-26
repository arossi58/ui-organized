<script lang="ts">
  import { CodeBlock } from "@ui-organized/svelte";
  import { fakeHighlight } from "./codeHighlight.js";
  // `highlighted` stands for the `highlight` function; see cases/CodeBlock.tsx.
  let { highlighted, ...props }: Record<string, any> = $props();
</script>

<CodeBlock {...(props as any)} highlight={highlighted ? fakeHighlight : undefined} />
