<!--
  A Button with a label, driven entirely by spread props.

  Snippets cannot be written by hand outside a component, so the Svelte side of
  a parity case is expressed as a real component using the real syntax — which
  is also what a consumer writes, and therefore what should be under test.

  `iconOnly` has to branch *outside* the component rather than render an empty
  label inside it. Every library decides `.btn--icon-only` by asking whether it
  was given children at all — Svelte checks `children === undefined`, Vue checks
  `!slots.default`, React checks the prop — and a branch inside the tag still
  passes children, just ones that render nothing.
-->
<script lang="ts">
  import { Button } from "@ui-organized/svelte";

  let { iconOnly = false, ...props }: Record<string, unknown> = $props();
</script>

{#if iconOnly}
  <Button {...props} />
{:else}
  <Button {...props}>Label</Button>
{/if}
