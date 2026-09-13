<!--
  A from–to date range built from two native `<input type="date">` controls on
  the Input field surface, under one shared label, helper text and error.

  On fine pointers the leading calendar buttons open one shared DS-styled
  two-month range calendar; on touch devices they defer to the OS-native picker.
  The two ends auto-constrain each other (the end can't precede the start) on top
  of the optional `min` / `max` bounds. Works with `v-model` or uncontrolled
  (`defaultValue`).
-->
<script setup lang="ts">
import { computed, ref, useAttrs, useId } from "vue";
import { Popover as ArkPopover } from "@ark-ui/vue";
import { clsx } from "clsx";
import {
  CONTROL_ICON_SIZE,
  inputFieldStyles,
  parseISODate,
  popupControls,
  toISODate,
} from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import FieldError from "../FieldError/FieldError.vue";
import Calendar from "../Calendar/Calendar.vue";
import DatePopover from "../DateField/DatePopover.vue";
import { datePopoverPositioning } from "../DateField/datePopoverPositioning.js";
import { openDatePicker } from "../DateField/openDatePicker.js";
import { useCoarsePointer } from "../DateField/useCoarsePointer.js";
import type { DateRangeInputProps, DateRangeValue } from "./DateRangeInput.types.js";
// Shares the Input field surface/state styling; InputAffix.css supplies the
// leading calendar buttons; DateRangeInput.css lays out the start/end pair.
import "@ui-organized/core/components/Input/Input.css";
import "@ui-organized/core/components/Input/InputAffix.css";
import "@ui-organized/core/components/DateRangeInput/DateRangeInput.css";

type Side = "start" | "end";
const SIDES = ["start", "end"] as const;

defineOptions({ inheritAttrs: false });
// Every boolean forwarded on must default to `undefined`. Vue casts an absent
// Boolean prop to `false`, and neither Ark nor the native control can tell that
// apart from a deliberate one — see ../../props.ts.
const props = withDefaults(defineProps<DateRangeInputProps>(), {
  required: undefined,
  disabled: undefined,
  startLabel: "Start date",
  endLabel: "End date",
  separator: "–",
});
/**
 * `valueChange` rather than `change`, matching Select.
 *
 * A declared `change` emit would swallow a consumer's `@change` — which on a
 * component wrapping two native inputs is a listener they may well have meant
 * for the DOM event.
 */
const emit = defineEmits<{
  "update:modelValue": [value: DateRangeValue];
  valueChange: [value: DateRangeValue];
}>();

const attrs = useAttrs();
const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));
const iconSize = computed(() => CONTROL_ICON_SIZE[props.size ?? "md"]);

// React uses useId() here; this is Vue's equivalent. The group is a plain
// <div role="group">, so its name and description have to be wired by hand.
const generatedId = useId();
const labelId = `${generatedId}-label`;
const helperId = `${generatedId}-helper`;
const errorId = `${generatedId}-error`;

const coarse = useCoarsePointer();

const open = ref(false);
const rowEl = ref<HTMLDivElement | null>(null);
const activeDayEl = ref<HTMLButtonElement | null>(null);
const startEl = ref<HTMLInputElement | null>(null);
const endEl = ref<HTMLInputElement | null>(null);

// `defaultValue` seeds the uncontrolled range once; a later change to it must
// not overwrite what the user has picked.
const uncontrolled = ref<DateRangeValue>({
  start: props.defaultValue?.start ?? "",
  end: props.defaultValue?.end ?? "",
});
const current = computed<DateRangeValue>(() =>
  props.modelValue
    ? { start: props.modelValue.start ?? "", end: props.modelValue.end ?? "" }
    : uncontrolled.value,
);

function update(next: DateRangeValue) {
  uncontrolled.value = next;
  emit("update:modelValue", next);
  emit("valueChange", next);
}

function onFieldInput(side: Side, event: Event) {
  const next = (event.target as HTMLInputElement).value;
  update(
    side === "start"
      ? { start: next, end: current.value.end }
      : { start: current.value.start, end: next },
  );
}

function captureField(side: Side, el: unknown) {
  const node = (el as HTMLInputElement | null) ?? null;
  if (side === "start") startEl.value = node;
  else endEl.value = node;
}

const describedBy = computed(
  () =>
    [
      props.helperText && !isInvalid.value ? helperId : null,
      isInvalid.value && errorMessage.value ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined,
);

const rootClass = computed(() =>
  clsx(inputFieldStyles({ size: props.size }), "date-range", attrs.class as string),
);

/** The per-end attributes; the markup around them is identical for both. */
function fieldProps(side: Side) {
  const isStart = side === "start";
  return definedOnly({
    // Native date inputs are never `:placeholder-shown`; flag empty so the
    // mm/dd/yyyy chrome renders in the placeholder colour.
    "data-empty": (isStart ? current.value.start : current.value.end) ? undefined : true,
    value: isStart ? current.value.start : current.value.end,
    // The filled end becomes the other's bound, so the range can't invert.
    min: isStart ? props.min : current.value.start || props.min,
    max: isStart ? current.value.end || props.max : props.max,
    name: isStart ? props.startName : props.endName,
    required: props.required,
    disabled: props.disabled,
    "aria-label": isStart ? props.startLabel : props.endLabel,
    "aria-invalid": isInvalid.value || undefined,
  });
}

const pickerLabel = (side: Side) =>
  `${side === "start" ? props.startLabel : props.endLabel} — choose date`;

/** Touch path: hand the end over to the OS picker rather than the popover. */
const openNativePicker = (side: Side) =>
  openDatePicker(side === "start" ? startEl.value : endEl.value);

// Ark keeps aria-controls on the trigger at all times, but the popup it names is
// only mounted while open. popupControls drops it while closed — spread, not
// bound, so an undefined never strips the machine's own value. See props.ts.
const controls = computed(() => definedOnly(popupControls(open.value)));
const positioning = datePopoverPositioning(() => rowEl.value);
</script>

<template>
  <div
    role="group"
    :aria-labelledby="label ? labelId : undefined"
    :aria-describedby="describedBy"
    :data-disabled="disabled || undefined"
    :class="rootClass"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <span v-if="label" :id="labelId" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </span>

    <!--
      The row is written twice because a Vue template has no way to name a
      fragment and place it in two branches — React assigns it to a variable.
      The two differ only in the start button: an Ark popover trigger on a fine
      pointer, a plain button that calls `showPicker()` on a coarse one.
    -->
    <div v-if="coarse" ref="rowEl" class="date-range__row">
      <template v-for="side in SIDES" :key="side">
        <span
          v-if="side === 'end'"
          class="date-range__separator text-default-body-large"
          aria-hidden="true"
        >
          <slot name="separator">{{ separator }}</slot>
        </span>
        <div class="input-affix date-range__field">
          <button
            type="button"
            class="input-affix__adornment input-affix__adornment--start input-affix__action"
            :disabled="disabled"
            :aria-label="pickerLabel(side)"
            @click="openNativePicker(side)"
          >
            <Icon name="calendar" :size="iconSize" />
          </button>
          <input
            :ref="(el) => captureField(side, el)"
            type="date"
            class="field__control field__control--affix-start"
            v-bind="fieldProps(side)"
            @input="(event) => onFieldInput(side, event)"
          />
        </div>
      </template>
    </div>

    <ArkPopover.Root
      v-else
      :open="open"
      :positioning="positioning"
      :initial-focus-el="() => activeDayEl"
      @open-change="(details) => (open = details.open)"
    >
      <div ref="rowEl" class="date-range__row">
        <template v-for="side in SIDES" :key="side">
          <span
            v-if="side === 'end'"
            class="date-range__separator text-default-body-large"
            aria-hidden="true"
          >
            <slot name="separator">{{ separator }}</slot>
          </span>
          <div class="input-affix date-range__field">
            <ArkPopover.Trigger v-if="side === 'start'" as-child v-bind="controls">
              <button
                type="button"
                class="input-affix__adornment input-affix__adornment--start input-affix__action"
                :disabled="disabled"
                :aria-label="pickerLabel('start')"
              >
                <Icon name="calendar" :size="iconSize" />
              </button>
            </ArkPopover.Trigger>
            <button
              v-else
              type="button"
              class="input-affix__adornment input-affix__adornment--start input-affix__action"
              :disabled="disabled"
              :aria-label="pickerLabel('end')"
              @click="open = true"
            >
              <Icon name="calendar" :size="iconSize" />
            </button>
            <input
              :ref="(el) => captureField(side, el)"
              type="date"
              class="field__control field__control--affix-start"
              v-bind="fieldProps(side)"
              @input="(event) => onFieldInput(side, event)"
            />
          </div>
        </template>
      </div>
      <DatePopover
        :container="portalContainer"
        :label="`${startLabel} — ${endLabel}, choose dates`"
      >
        <Calendar
          mode="range"
          :num-months="2"
          :range-value="{
            start: parseISODate(current.start),
            end: parseISODate(current.end),
          }"
          :min="parseISODate(min)"
          :max="parseISODate(max)"
          :on-range-change="
            (r) =>
              update({
                start: r.start ? toISODate(r.start) : '',
                end: r.end ? toISODate(r.end) : '',
              })
          "
          :on-range-complete="() => (open = false)"
          :on-active-day="(el: HTMLButtonElement | null) => (activeDayEl = el)"
        />
      </DatePopover>
    </ArkPopover.Root>

    <p v-if="helperText && !isInvalid" :id="helperId" class="field__description">
      {{ helperText }}
    </p>
    <FieldError v-if="isInvalid && errorMessage" :id="errorId" :message="errorMessage" />
  </div>
</template>
