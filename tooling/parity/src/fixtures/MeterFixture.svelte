<script lang="ts">
  import { Meter } from "@ui-organized/svelte";

  // `aria-label` is passed straight through — Svelte matches a prop name
  // verbatim, so the hyphenated spelling lands on the declared prop.
  let { ...props }: Record<string, any> = $props();
</script>

<Meter {...props} />
