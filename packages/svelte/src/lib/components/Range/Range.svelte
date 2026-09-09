<!--
  A labelled range slider.

  Snapping is controlled two ways:
  - `step` snaps at regular intervals between `min` and `max` (native, keyboard
    and pointer).
  - `snapValues` snaps to a fixed set of allowed values. These are driven by
    index so the thumb lands exactly on an allowed value — and lands on the
    adjacent one with a single arrow-key press — regardless of their spacing.
-->
<script lang="ts">
  import { Field, Slider } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { OMIT_ARIA, rangeStyles } from "@ui-organized/core";
  import FieldError from "../FieldError/FieldError.svelte";
  import type { RangeProps } from "./Range.types.js";
  import "@ui-organized/core/components/Range/Range.css";

  let {
    label,
    value = $bindable(),
    defaultValue,
    onValueChange,
    onValueCommitted,
    min = 0,
    max = 100,
    step = 1,
    snapValues,
    rangeLabels = false,
    startLabel,
    endLabel,
    size,
    error,
    disabled,
    hideValue = false,
    formatValue,
    name,
    id,
    class: className,
    "aria-label": ariaLabel,
  }: RangeProps = $props();

  function clamp(n: number, lower: number, upper: number): number {
    return Math.min(Math.max(n, lower), upper);
  }

  /** Index of the value in `sorted` (ascending) closest to `target`. */
  function nearestIndex(sorted: readonly number[], target: number): number {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < sorted.length; i += 1) {
      const v = sorted[i];
      if (v === undefined) continue;
      const dist = Math.abs(v - target);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  }

  const isInvalid = $derived(!!error);
  const errorMessage = $derived(typeof error === "string" ? error : undefined);

  // The caption is a Field.Label — it carries the *field's* id, while the slider
  // machine names its thumb after its own Label part, which this component never
  // renders. Left alone the thumb points at nothing and has no accessible name;
  // pinning both to one id is what joins the caption to the thumb. React uses
  // useId() here; this is Svelte's equivalent.
  const labelId = $props.id();

  // A fixed set of allowed values is driven by index, so pointer drags and
  // arrow keys both settle exactly on an allowed value (evenly spaced).
  const snapPoints = $derived(
    snapValues && snapValues.length > 0 ? [...snapValues].sort((a, b) => a - b) : null,
  );

  const resolvedMin = $derived(snapPoints ? (snapPoints[0] ?? min) : min);
  const resolvedMax = $derived(
    snapPoints ? (snapPoints[snapPoints.length - 1] ?? max) : max,
  );

  /** Resolve a public value from a raw slider value (an index when snapping). */
  function toPublic(raw: readonly number[]): number {
    const n = raw[0] ?? 0;
    if (!snapPoints) return n;
    const idx = clamp(Math.round(n), 0, snapPoints.length - 1);
    return snapPoints[idx] ?? resolvedMin;
  }

  // Read off the props rather than the deriveds, so the compiler sees a closure
  // rather than a one-shot reference to reactive state.
  function initialValue(): number {
    const points = snapValues && snapValues.length > 0 ? [...snapValues].sort((a, b) => a - b) : null;
    const base = points ? (points[0] ?? min) : min;
    const initial = defaultValue ?? base;
    if (points) return points[nearestIndex(points, initial)] ?? base;
    return clamp(initial, min, max);
  }

  let uncontrolled = $state(initialValue());
  const current = $derived(value !== undefined ? value : uncontrolled);

  // What the underlying Ark slider actually drives.
  const sliderValue = $derived(snapPoints ? nearestIndex(snapPoints, current) : current);

  const displayValue = $derived(formatValue ? formatValue(current) : String(current));

  const resolvedStartLabel = $derived(startLabel ?? resolvedMin);
  const resolvedEndLabel = $derived(endLabel ?? resolvedMax);
</script>

<Field.Root class={clsx(rangeStyles({ size }), className)} invalid={isInvalid} {disabled}>
  <div class="range__header">
    {#if label}
      <Field.Label id={labelId} class="range__label text-default-body-small">{label}</Field.Label>
    {/if}
    {#if !hideValue}
      <span class="range__value text-default-body-large">{displayValue}</span>
    {/if}
  </div>

  <Slider.Root
    class="range__slider"
    ids={label ? { label: labelId } : undefined}
    value={[sliderValue]}
    onValueChange={(details) => {
      const next = toPublic(details.value);
      uncontrolled = next;
      value = next;
      onValueChange?.(next);
    }}
    onValueChangeEnd={(details) => onValueCommitted?.(toPublic(details.value))}
    min={snapPoints ? 0 : min}
    max={snapPoints ? snapPoints.length - 1 : max}
    step={snapPoints ? 1 : step}
    {disabled}
    {name}
    {id}
  >
    <div class="range__row">
      {#if rangeLabels}
        <span class="range__range-label range__range-label--start text-default-body-small">
          {#if typeof resolvedStartLabel === "function"}{@render resolvedStartLabel()}{:else}{resolvedStartLabel}{/if}
        </span>
      {/if}
      <Slider.Control class="range__control">
        <Slider.Track class="range__track">
          <Slider.Range class="range__indicator" />
          <!--
            The thumb is named by the caption above, or by `aria-label` when
            there is none. Ark points it at its own Label part unconditionally,
            and this component renders no such part — a dangling `aria-labelledby`
            outranks the `aria-label` that is actually there, leaving the thumb
            nameless.
          -->
          <Slider.Thumb
            index={0}
            class="range__thumb"
            aria-labelledby={label ? undefined : OMIT_ARIA}
            aria-label={label ? undefined : ariaLabel}
          >
            <Slider.HiddenInput />
          </Slider.Thumb>
        </Slider.Track>
      </Slider.Control>
      {#if rangeLabels}
        <span class="range__range-label range__range-label--end text-default-body-small">
          {#if typeof resolvedEndLabel === "function"}{@render resolvedEndLabel()}{:else}{resolvedEndLabel}{/if}
        </span>
      {/if}
    </div>
  </Slider.Root>

  {#if isInvalid && errorMessage}
    <Field.ErrorText>
      {#snippet asChild(props)}
        <FieldError {...props()} message={errorMessage} />
      {/snippet}
    </Field.ErrorText>
  {/if}
</Field.Root>
