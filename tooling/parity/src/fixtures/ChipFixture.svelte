<script lang="ts">
  import { Chip, ChipSegment } from "@ui-organized/svelte";

  /**
   * `removable` and `segmented` are translated, exactly as the React builder in
   * `cases/Chip.tsx` translates them: each stands for handlers, which a props
   * object crossing the harness cannot carry. The harness carries the *intent*
   * across and compares the markup, which is the thing that has to agree.
   */
  let { removable, segmented, ...props }: Record<string, unknown> = $props();
  const noop = () => {};
</script>

<Chip {...props} onremove={removable ? noop : undefined}>
  {#if segmented}
    <ChipSegment part="label" onclick={noop}>Name</ChipSegment>
    <ChipSegment part="operator" onclick={noop}>is greater than</ChipSegment>
    <ChipSegment part="value" onclick={noop}>30</ChipSegment>
  {/if}
</Chip>
