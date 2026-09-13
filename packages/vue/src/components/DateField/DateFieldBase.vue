<!--
  Shared single date/time field used by DateInput and DateTimeInput.

  Internal: not exported from the package barrel and given no parity case, since
  its whole public DOM is DateInput's and DateTimeInput's.

  The native `<input>` keeps full functionality (typing, value, min/max). The
  leading calendar button opens the DS-styled calendar popover on fine pointers
  (mouse), or the OS-native picker on touch devices. For datetime the popover
  adds a time field beneath the calendar.
-->
<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import { Field, Popover as ArkPopover } from "@ark-ui/vue";
import { clsx } from "clsx";
import {
  CONTROL_ICON_SIZE,
  inputFieldStyles,
  parseISODate,
  popupControls,
  toISODate,
  todayYMD,
  type YMD,
} from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Button from "../Button/Button.vue";
import Icon from "../Icon/Icon.vue";
import FieldError from "../FieldError/FieldError.vue";
import Calendar from "../Calendar/Calendar.vue";
import DatePopover from "./DatePopover.vue";
import { datePopoverPositioning } from "./datePopoverPositioning.js";
import { openDatePicker } from "./openDatePicker.js";
import { setNativeInputValue } from "./setNativeInputValue.js";
import { useCoarsePointer } from "./useCoarsePointer.js";
import type { DateFieldBaseProps } from "./DateFieldBase.types.js";
// Shares the Input field surface/state styling; InputAffix.css supplies the
// leading calendar button and hides the native picker chrome.
import "@ui-organized/core/components/Input/Input.css";
import "@ui-organized/core/components/Input/InputAffix.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts an
// absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<DateFieldBaseProps>(), {
  required: undefined,
  disabled: undefined,
});
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const attrs = useAttrs();
const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() =>
  typeof props.error === "string" ? props.error : undefined,
);
const isDateTime = computed(() => props.type === "datetime-local");
const iconSize = computed(() => CONTROL_ICON_SIZE[props.size ?? "md"]);

const coarse = useCoarsePointer();

const open = ref(false);
const inputEl = ref<HTMLInputElement | null>(null);
const fieldEl = ref<HTMLDivElement | null>(null);
const activeDayEl = ref<HTMLButtonElement | null>(null);

/**
 * Ark exposes the rendered element as `$el` rather than forwarding the DOM node
 * itself, so the ref lands on the component and the element is read off it.
 */
function captureInput(instance: unknown) {
  inputEl.value = (instance as { $el?: HTMLInputElement } | null)?.$el ?? null;
}

// Track the value so the calendar mirrors typed edits and can write back. The
// controlled half is just `modelValue`; the uncontrolled half is a local mirror
// seeded from `defaultValue`.
const uncontrolled = ref(String(props.defaultValue ?? ""));
const internalValue = computed(() =>
  props.modelValue !== undefined ? String(props.modelValue) : uncontrolled.value,
);

function onInput(event: Event) {
  const next = (event.target as HTMLInputElement).value;
  uncontrolled.value = next;
  emit("update:modelValue", next);
}

const datePart = computed(() => internalValue.value.split("T")[0] ?? "");
const timePart = computed(() => internalValue.value.split("T")[1] ?? "");

function handleDaySelect(day: YMD) {
  const iso = toISODate(day);
  if (isDateTime.value) {
    setNativeInputValue(inputEl.value, `${iso}T${timePart.value || "00:00"}`);
    // Keep the popover open so the time can still be set.
  } else {
    setNativeInputValue(inputEl.value, iso);
    open.value = false;
  }
}

function handleTimeChange(event: Event) {
  const day = datePart.value || toISODate(todayYMD());
  setNativeInputValue(inputEl.value, `${day}T${(event.target as HTMLInputElement).value}`);
}

const rootClass = computed(() =>
  clsx(inputFieldStyles({ size: props.size }), attrs.class as string),
);
const inputProps = computed(() =>
  definedOnly({
    ...attrs,
    class: undefined,
    type: props.type,
    // Native date/time inputs are never `:placeholder-shown`; flag the empty
    // state so the mm/dd/yyyy chrome renders in the placeholder colour.
    "data-empty": internalValue.value ? undefined : true,
    required: props.required,
    disabled: props.disabled,
    value: internalValue.value,
    min: props.min,
    max: props.max,
  }),
);
// Ark keeps aria-controls on the trigger at all times, but the popup it names is
// only mounted while open. popupControls drops it while closed — spread, not
// bound, so an undefined never strips the machine's own value. See props.ts.
const controls = computed(() => definedOnly(popupControls(open.value)));
const positioning = datePopoverPositioning(() => fieldEl.value);
</script>

<template>
  <Field.Root :class="rootClass" :invalid="isInvalid">
    <Field.Label v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </Field.Label>

    <div v-if="coarse" ref="fieldEl" class="input-affix">
      <button
        type="button"
        class="input-affix__adornment input-affix__adornment--start input-affix__action"
        :disabled="disabled"
        :aria-label="pickerLabel"
        @click="openDatePicker(inputEl)"
      >
        <Icon name="calendar" :size="iconSize" />
      </button>
      <Field.Input
        :ref="captureInput"
        class="field__control field__control--affix-start"
        v-bind="inputProps"
        @input="onInput"
      />
    </div>

    <ArkPopover.Root
      v-else
      :open="open"
      :positioning="positioning"
      :initial-focus-el="() => activeDayEl"
      @open-change="(details) => (open = details.open)"
    >
      <div ref="fieldEl" class="input-affix">
        <ArkPopover.Trigger as-child v-bind="controls">
          <button
            type="button"
            class="input-affix__adornment input-affix__adornment--start input-affix__action"
            :disabled="disabled"
            :aria-label="pickerLabel"
          >
            <Icon name="calendar" :size="iconSize" />
          </button>
        </ArkPopover.Trigger>
        <Field.Input
          :ref="captureInput"
          class="field__control field__control--affix-start"
          v-bind="inputProps"
          @input="onInput"
        />
      </div>
      <DatePopover :container="portalContainer" :label="pickerLabel">
        <Calendar
          mode="single"
          :value="parseISODate(datePart)"
          :min="parseISODate(min)"
          :max="parseISODate(max)"
          :on-select="handleDaySelect"
          :on-active-day="(el: HTMLButtonElement | null) => (activeDayEl = el)"
        />
        <div v-if="isDateTime" class="date-popover__footer">
          <input
            type="time"
            class="field__control date-popover__time"
            :data-empty="timePart ? undefined : true"
            :value="timePart"
            aria-label="Time"
            @input="handleTimeChange"
          />
          <Button
            type="button"
            intent="primary"
            size="md"
            class="date-popover__done"
            @click="open = false"
          >
            Done
          </Button>
        </div>
      </DatePopover>
    </ArkPopover.Root>

    <Field.HelperText v-if="helperText && !isInvalid" class="field__description">
      {{ helperText }}
    </Field.HelperText>
    <!--
      Ark's ErrorText renders only while the Field is invalid, and `asChild`
      hands its props to whatever replaces it — here the shared FieldError, so
      the message keeps its icon and its aria-describedby wiring.
    -->
    <Field.ErrorText v-if="isInvalid && errorMessage" as-child>
      <FieldError :message="errorMessage" />
    </Field.ErrorText>
  </Field.Root>
</template>
