<script lang="ts">
  import { clsx } from "clsx";
  import { chipStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import ChipSegment from "./ChipSegment.svelte";
  import { provideChipDisabled } from "./chipContext.js";
  import type { ChipProps } from "./Chip.types.js";
  import "@ui-organized/core/components/Chip/Chip.css";
  import { glyph } from "../../icons/glyph.js";

  /** The dismiss icon, at the size `Tag`'s icons render. */
  const ICON_SIZE = 16;

  let {
    label,
    operator,
    value,
    children,
    selected = false,
    incomplete = false,
    disabled = false,
    onremove,
    removeLabel,
    class: className,
    ...rest
  }: ChipProps = $props();

  provideChipDisabled(() => disabled);
</script>

<!-- Segmented (Figma 2462:2636). Every segment and the dismiss control are
     SIBLINGS in a plain group: a button inside a button is invalid HTML and an
     axe `nested-interactive` violation. -->
<span
  role="group"
  class={clsx(
    chipStyles(),
    selected && "chip--selected",
    incomplete && "chip--incomplete",
    disabled && "chip--disabled",
    className,
  )}
  {...rest}
>
  {#if label}<ChipSegment part="label">{label}</ChipSegment>{/if}
  {#if operator}<ChipSegment part="operator">{operator}</ChipSegment>{/if}
  {#if value}<ChipSegment part="value">{value}</ChipSegment>{/if}
  {@render children?.()}

  {#if onremove}
    <button
      type="button"
      class="chip__remove"
      aria-label={removeLabel}
      {disabled}
      onclick={onremove}
    >
      <Icon name={glyph("close")} size={ICON_SIZE} />
    </button>
  {/if}
</span>
