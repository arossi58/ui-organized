<script lang="ts">
  import { SegmentGroup as ArkSegmentGroup } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { OMIT_ARIA, segmentedControlStyles } from "@ui-organized/core";
  import Icon from "../Icon/Icon.svelte";
  import type { SegmentedControlProps } from "./SegmentedControl.types.js";
  import "@ui-organized/core/components/SegmentedControl/SegmentedControl.css";

  /** Leading icons render at 16px across every size. */
  const ICON_SIZE = 16;

  let {
    items,
    value = $bindable(),
    defaultValue,
    onValueChange,
    size = "md",
    disabled,
    name,
    class: className,
    "aria-label": ariaLabel,
  }: SegmentedControlProps = $props();

  // Uncontrolled controls default to the first segment so the indicator has a
  // starting position; ignored when a controlled `value` is supplied.
  const resolvedDefault = $derived(
    value == null ? (defaultValue ?? items[0]?.value) : undefined,
  );
</script>

<!--
  The control is named by `aria-label`; it renders no Label part, so Ark's
  `aria-labelledby` would point at an element that never exists — and a dangling
  IDREF outranks the label that is actually there.
-->
<ArkSegmentGroup.Root
  {value}
  defaultValue={resolvedDefault}
  onValueChange={(details) => {
    if (details.value != null) {
      value = details.value;
      onValueChange?.(details.value);
    }
  }}
  {disabled}
  {name}
  orientation="horizontal"
  aria-label={ariaLabel}
  aria-labelledby={OMIT_ARIA}
  class={clsx(segmentedControlStyles({ size }), className)}
>
  <!-- Sliding highlight behind the selected segment. -->
  <ArkSegmentGroup.Indicator class="segmented__indicator" />
  {#each items as item (item.value)}
    <ArkSegmentGroup.Item value={item.value} disabled={item.disabled} class="segmented__item">
      {#if item.icon}
        <Icon name={item.icon} size={ICON_SIZE} class="segmented__item-icon" />
      {/if}
      <ArkSegmentGroup.ItemText class="segmented__item-text">
        {#if typeof item.label === "string"}{item.label}{:else}{@render item.label()}{/if}
      </ArkSegmentGroup.ItemText>
      <ArkSegmentGroup.ItemHiddenInput />
    </ArkSegmentGroup.Item>
  {/each}
</ArkSegmentGroup.Root>
