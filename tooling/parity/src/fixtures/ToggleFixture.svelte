<script lang="ts">
  import { Toggle, ToggleGroup } from "@ui-organized/svelte";
  let { label, items, ...props }: Record<string, any> = $props();
</script>

<!--
  `label` and `items` are the fixture's own: a Svelte label is a snippet, which
  cannot be handed over as a case prop, and a group is the same component with
  children rather than a second entry point.

  Both branches take the label's absence seriously rather than rendering an empty
  snippet — an always-present `children` reads as "I have content" and would turn
  every icon-only toggle into a labelled one.
-->
{#if items}
  <ToggleGroup {...props}>
    {#each items as item (item.value)}
      {#if item.label === undefined}
        <Toggle value={item.value} icon={item.icon} disabled={item.disabled} />
      {:else}
        <Toggle value={item.value} icon={item.icon} disabled={item.disabled}>
          {item.label}
        </Toggle>
      {/if}
    {/each}
  </ToggleGroup>
{:else if label === undefined}
  <Toggle {...props} />
{:else}
  <Toggle {...props}>{label}</Toggle>
{/if}
