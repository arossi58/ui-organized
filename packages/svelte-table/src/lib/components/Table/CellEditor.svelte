<!--
  The editor's wrapper, and the thing that puts focus inside it.

  Focus is the package's job, not the consumer's: `meta.edit.render` returns
  whatever control the consumer likes, and most of the library's controls do not
  expose their inner `<input>` — so a consumer trying to do this themselves would
  reach for `autofocus`, which is unreliable for an element mounting
  mid-interaction.

  A component rather than an effect inside `TableCell` so the mount hook exists
  only while something is being edited, instead of once per rendered cell.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { onMount } from "svelte";

  let { children }: { children?: Snippet } = $props();
  let host = $state<HTMLElement | null>(null);

  onMount(() => {
    const focusable = host?.querySelector<HTMLElement>(
      'input:not([type="hidden"]), textarea, select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
    if (focusable instanceof HTMLInputElement) focusable.select();
  });
</script>

<span bind:this={host} class="data-table__editor">{@render children?.()}</span>
