<!--
  A Button with a label, driven entirely by spread props.

  Snippets cannot be written by hand outside a component, so the Svelte side of
  a parity case is expressed as a real component using the real syntax — which
  is also what a consumer writes, and therefore what should be under test.
-->
<script lang="ts">
  import { Button } from "@ui-organized/svelte";

  let { ...props }: Record<string, unknown> = $props();
</script>

<Button {...props}>Label</Button>
