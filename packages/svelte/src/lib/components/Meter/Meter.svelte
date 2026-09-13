<!--
  A static measurement inside a known range — disk usage, a score, a quota.

  Distinct from Progress, which tracks a task and can be indeterminate; a meter
  never can. Ark UI has no Meter primitive and none is needed: everything here is
  `role="meter"` plus the ARIA value attributes, so the facade owns the
  accessible markup directly.
-->
<script lang="ts">
  import { clsx } from "clsx";
  import { meterStyles } from "@ui-organized/core";
  import type { MeterProps } from "./Meter.types.js";
  import "@ui-organized/core/components/Meter/Meter.css";

  let {
    value,
    min = 0,
    max = 100,
    label,
    showValue = false,
    format,
    variant,
    size,
    class: className,
    "aria-label": ariaLabel,
  }: MeterProps = $props();

  const showHeader = $derived(label != null || showValue);
  const clamped = $derived(Math.min(Math.max(value, min), max));
  // A zero-width range would divide by zero, so it reads as empty rather than NaN.
  const percent = $derived(max > min ? ((clamped - min) / (max - min)) * 100 : 0);
  const formatted = $derived(new Intl.NumberFormat(undefined, format).format(value));

  // `role="meter"` needs an accessible name: the caption when there is one,
  // otherwise whatever the caller passes. A bare number is not a measurement.
  // React uses useId() here; this is Svelte's equivalent.
  const labelId = $props.id();
</script>

<div
  role="meter"
  aria-valuenow={value}
  aria-valuemin={min}
  aria-valuemax={max}
  aria-valuetext={formatted}
  aria-labelledby={label != null ? labelId : undefined}
  aria-label={label == null ? ariaLabel : undefined}
  class={clsx(meterStyles({ variant, size }), className)}
>
  {#if showHeader}
    <div class="meter__header text-default-body-small">
      {#if label != null}
        <span class="meter__label" id={labelId}>
          {#if typeof label === "string"}{label}{:else}{@render label()}{/if}
        </span>
      {/if}
      {#if showValue}
        <span class="meter__value">{formatted}</span>
      {/if}
    </div>
  {/if}
  <div class="meter__track">
    <div class="meter__indicator" style="width: {percent}%"></div>
  </div>
</div>
