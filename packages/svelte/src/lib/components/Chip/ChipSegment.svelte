<!--
  One part of a chip's sentence. A `<button>` once it has something to do, a
  `<span>` until then: a segment that opens nothing must not be a button, or
  every static token in a list puts empty stops in the tab order. `disabled`
  counts — a real disabled control is what exempts the dimmed text from axe's
  contrast rule.

  Every other prop lands on the button, so an Ark trigger's `asChild` props
  project onto exactly the segment that opens it.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { chipSegmentStyles } from "@ui-organized/core";
  import { readChipDisabled } from "./chipContext.js";
  import type { ChipSegmentProps } from "./Chip.types.js";

  let {
    part,
    class: className,
    disabled: ownDisabled,
    children,
    ...rest
  }: ChipSegmentProps = $props();

  const chipDisabled = readChipDisabled();
  const disabled = $derived(chipDisabled() || ownDisabled === true);
  const classes = $derived(clsx(chipSegmentStyles({ part }), className));
</script>

{#if rest.onclick === undefined && !disabled}
  <span class={classes}>{@render children?.()}</span>
{:else}
  <button type="button" class={classes} {disabled} {...rest}>{@render children?.()}</button>
{/if}
