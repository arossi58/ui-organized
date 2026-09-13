<!--
  A labelled range slider.

  Snapping is controlled two ways:
  - `step` snaps at regular intervals between `min` and `max` (native, keyboard
    and pointer).
  - `snapValues` snaps to a fixed set of allowed values. These are driven by
    index so the thumb lands exactly on an allowed value — and lands on the
    adjacent one with a single arrow-key press — regardless of their spacing.
-->
<script setup lang="ts">
import { computed, ref, useAttrs, useId } from "vue";
import { Field, Slider } from "@ark-ui/vue";
import { clsx } from "clsx";
import { OMIT_ARIA, rangeStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import FieldError from "../FieldError/FieldError.vue";
import type { RangeProps } from "./Range.types.js";
import "@ui-organized/core/components/Range/Range.css";

defineOptions({ inheritAttrs: false });
// `disabled` is forwarded to Ark, so it must default to `undefined`: Vue casts
// an absent Boolean prop to `false` and `definedOnly` would then forward that
// as a deliberate choice. See ../../props.ts. `rangeLabels` and `hideValue`
// stay with Vue's cast, which is the `false` React declares for both.
const props = withDefaults(defineProps<RangeProps>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: number];
  valueChange: [value: number];
  valueCommitted: [value: number];
}>();

const attrs = useAttrs();

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

const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));
const rootClass = computed(() => clsx(rangeStyles({ size: props.size }), attrs.class as string));

// The caption is a Field.Label — it carries the *field's* id, while the slider
// machine names its thumb after its own Label part, which this component never
// renders. Left alone the thumb points at nothing and has no accessible name;
// pinning both to one id is what joins the caption to the thumb. React uses
// useId() here; this is Vue's equivalent.
const labelId = useId();

// Declared as `ariaLabel` — see the prop's doc comment for why the hyphenated
// spelling cannot work. `attrs` is still checked, for a consumer who spreads
// the attribute in from a wrapper that does not declare it.
const ariaLabel = computed(() => props.ariaLabel ?? (attrs["aria-label"] as string | undefined));

// A fixed set of allowed values is driven by index, so pointer drags and arrow
// keys both settle exactly on an allowed value (evenly spaced).
const snapPoints = computed(() =>
  props.snapValues && props.snapValues.length > 0
    ? [...props.snapValues].sort((a, b) => a - b)
    : null,
);

const resolvedMin = computed(() => snapPoints.value?.[0] ?? props.min);
const resolvedMax = computed(
  () => snapPoints.value?.[snapPoints.value.length - 1] ?? props.max,
);

/** Resolve a public value from a raw slider value (an index when snapping). */
function toPublic(raw: readonly number[]): number {
  const n = raw[0] ?? 0;
  const points = snapPoints.value;
  if (!points) return n;
  const idx = clamp(Math.round(n), 0, points.length - 1);
  return points[idx] ?? resolvedMin.value;
}

// Read off the props rather than the computeds: this runs once, at setup, and
// must not make the initial state depend on anything that can later change.
function initialValue(): number {
  const points =
    props.snapValues && props.snapValues.length > 0
      ? [...props.snapValues].sort((a, b) => a - b)
      : null;
  const base = points?.[0] ?? props.min;
  const initial = props.defaultValue ?? base;
  if (points) return points[nearestIndex(points, initial)] ?? base;
  return clamp(initial, props.min, props.max);
}

const uncontrolled = ref<number>(initialValue());
const current = computed(() =>
  props.modelValue !== undefined ? props.modelValue : uncontrolled.value,
);

// What the underlying Ark slider actually drives.
const sliderValue = computed(() =>
  snapPoints.value ? nearestIndex(snapPoints.value, current.value) : current.value,
);

const displayValue = computed(() =>
  props.formatValue ? props.formatValue(current.value) : String(current.value),
);

const fieldProps = computed(() => definedOnly({ disabled: props.disabled }));

const sliderProps = computed(() =>
  definedOnly({
    ids: props.label ? { label: labelId } : undefined,
    disabled: props.disabled,
    name: props.name,
    id: props.id,
  }),
);

/**
 * The thumb's ARIA overrides, as an object that is *empty* when a label exists.
 *
 * The thumb is named by the caption above, or by `aria-label` when there is
 * none. Ark points it at its own Label part unconditionally, and this component
 * renders no such part — a dangling `aria-labelledby` outranks the `aria-label`
 * that is actually there, leaving the thumb nameless.
 *
 * Spread rather than bound: an explicit `:aria-labelledby="undefined"` would
 * remove the reference Ark just computed, which is the one case where it is
 * correct. See ../../props.ts.
 */
const thumbAria = computed(() =>
  props.label
    ? {}
    : definedOnly({ "aria-labelledby": OMIT_ARIA, "aria-label": ariaLabel.value }),
);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handlers' details argument needs one.
function onValueChange(details: { value: number[] }) {
  const next = toPublic(details.value);
  if (props.modelValue === undefined) uncontrolled.value = next;
  emit("update:modelValue", next);
  emit("valueChange", next);
}
function onValueChangeEnd(details: { value: number[] }) {
  emit("valueCommitted", toPublic(details.value));
}
</script>

<template>
  <Field.Root :class="rootClass" :invalid="isInvalid" v-bind="fieldProps">
    <div class="range__header">
      <Field.Label v-if="label" :id="labelId" class="range__label text-default-body-small">
        {{ label }}
      </Field.Label>
      <span v-if="!hideValue" class="range__value text-default-body-large">
        {{ displayValue }}
      </span>
    </div>

    <Slider.Root
      class="range__slider"
      :model-value="[sliderValue]"
      :min="snapPoints ? 0 : min"
      :max="snapPoints ? snapPoints.length - 1 : max"
      :step="snapPoints ? 1 : step"
      v-bind="sliderProps"
      @value-change="onValueChange"
      @value-change-end="onValueChangeEnd"
    >
      <div class="range__row">
        <span
          v-if="rangeLabels"
          class="range__range-label range__range-label--start text-default-body-small"
        >
          {{ startLabel ?? resolvedMin }}
        </span>
        <Slider.Control class="range__control">
          <Slider.Track class="range__track">
            <Slider.Range class="range__indicator" />
            <Slider.Thumb :index="0" class="range__thumb" v-bind="thumbAria">
              <Slider.HiddenInput />
            </Slider.Thumb>
          </Slider.Track>
        </Slider.Control>
        <span
          v-if="rangeLabels"
          class="range__range-label range__range-label--end text-default-body-small"
        >
          {{ endLabel ?? resolvedMax }}
        </span>
      </div>
    </Slider.Root>

    <Field.ErrorText v-if="isInvalid && errorMessage" as-child>
      <FieldError :message="errorMessage" />
    </Field.ErrorText>
  </Field.Root>
</template>
