<!--
  Calendar-driven date field, backed by Ark's DatePicker machine.

  The public API is ISO date strings; the machine works in `DateValue` objects,
  and the conversion happens at this boundary so nothing downstream has to know
  about `@internationalized/date`.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { DatePicker as ArkDatePicker, parseDate } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, datePickerStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import FieldError from "../FieldError/FieldError.vue";
import type { DatePickerProps } from "./DatePicker.types.js";
import "@ui-organized/core/components/DatePicker/DatePicker.css";

/** Weekday header and navigation glyphs stay one step below the cell text. */
const NAV_ICON_SIZE = 16;

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts an
// absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts. `open: false` in particular means
// "controlled and closed" and would pin the calendar shut forever.
const props = withDefaults(defineProps<DatePickerProps>(), {
  size: "md",
  open: undefined,
  defaultOpen: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  valueChange: [value: string[]];
  "update:open": [open: boolean];
  openChange: [open: boolean];
}>();

const attrs = useAttrs();
const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));
const iconSize = computed(() => CONTROL_ICON_SIZE[props.size]);

const rootClass = computed(() =>
  clsx(datePickerStyles({ size: props.size, variant: props.variant }), attrs.class as string),
);

// ISO dates in, parsed calendar dates out. Ark Vue names the controlled value
// `modelValue`; see Select for the same rename.
const rootProps = computed(() =>
  definedOnly({
    modelValue: props.modelValue ? props.modelValue.map((d) => parseDate(d)) : undefined,
    defaultValue: props.defaultValue ? props.defaultValue.map((d) => parseDate(d)) : undefined,
    selectionMode: props.selectionMode,
    min: props.min ? parseDate(props.min) : undefined,
    max: props.max ? parseDate(props.max) : undefined,
    numOfMonths: props.numOfMonths,
    locale: props.locale,
    open: props.open,
    defaultOpen: props.defaultOpen,
    required: props.required,
    disabled: props.disabled,
    readOnly: props.readOnly,
    name: props.name,
  }),
);
</script>

<template>
  <ArkDatePicker.Root
    :class="rootClass"
    v-bind="rootProps"
    :invalid="isInvalid"
    :positioning="{ placement: 'bottom-start', gutter: 4 }"
    @value-change="
      (details) => {
        const next = details.value.map(String);
        emit('update:modelValue', next);
        emit('valueChange', next);
      }
    "
    @open-change="
      (details) => {
        emit('update:open', details.open);
        emit('openChange', details.open);
      }
    "
  >
    <ArkDatePicker.Label v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </ArkDatePicker.Label>

    <ArkDatePicker.Control class="date-picker__control">
      <ArkDatePicker.Input class="date-picker__input" :index="0" />
      <ArkDatePicker.Input
        v-if="selectionMode === 'range'"
        class="date-picker__input"
        :index="1"
      />
      <ArkDatePicker.Trigger class="date-picker__trigger">
        <Icon name="calendar" :size="iconSize" />
      </ArkDatePicker.Trigger>
    </ArkDatePicker.Control>

    <!--
      Vue has no Ark Portal component — Teleport is built into the framework, and
      Ark Vue relies on it rather than shipping its own.
    -->
    <Teleport :to="portalContainer ?? 'body'">
      <!--
        The positioner class must stay a plain string literal — the
        overlay-stacking test scans for it, and a clsx() call here silently
        unregisters the layer.
      -->
      <ArkDatePicker.Positioner class="date-picker__positioner">
        <ArkDatePicker.Content class="date-picker__popup">
          <ArkDatePicker.View view="day">
            <ArkDatePicker.Context v-slot="api">
              <ArkDatePicker.ViewControl class="date-picker__view-control">
                <ArkDatePicker.PrevTrigger class="date-picker__nav">
                  <Icon name="chevron-left" :size="NAV_ICON_SIZE" />
                </ArkDatePicker.PrevTrigger>
                <ArkDatePicker.ViewTrigger class="date-picker__view-trigger">
                  <ArkDatePicker.RangeText />
                </ArkDatePicker.ViewTrigger>
                <ArkDatePicker.NextTrigger class="date-picker__nav">
                  <Icon name="chevron-right" :size="NAV_ICON_SIZE" />
                </ArkDatePicker.NextTrigger>
              </ArkDatePicker.ViewControl>

              <ArkDatePicker.Table class="date-picker__table">
                <ArkDatePicker.TableHead>
                  <ArkDatePicker.TableRow>
                    <ArkDatePicker.TableHeader
                      v-for="day in api.weekDays"
                      :key="day.long"
                      class="date-picker__weekday"
                      :aria-label="day.long"
                    >
                      {{ day.narrow }}
                    </ArkDatePicker.TableHeader>
                  </ArkDatePicker.TableRow>
                </ArkDatePicker.TableHead>
                <ArkDatePicker.TableBody>
                  <ArkDatePicker.TableRow
                    v-for="(week, weekIndex) in api.weeks"
                    :key="weekIndex"
                  >
                    <ArkDatePicker.TableCell
                      v-for="(day, dayIndex) in week"
                      :key="dayIndex"
                      :value="day"
                      class="date-picker__cell"
                    >
                      <ArkDatePicker.TableCellTrigger class="date-picker__day">
                        {{ day.day }}
                      </ArkDatePicker.TableCellTrigger>
                    </ArkDatePicker.TableCell>
                  </ArkDatePicker.TableRow>
                </ArkDatePicker.TableBody>
              </ArkDatePicker.Table>
            </ArkDatePicker.Context>
          </ArkDatePicker.View>
        </ArkDatePicker.Content>
      </ArkDatePicker.Positioner>
    </Teleport>

    <span v-if="helperText && !isInvalid" class="field__description">{{ helperText }}</span>
    <FieldError v-if="isInvalid && errorMessage" :message="errorMessage" />
  </ArkDatePicker.Root>
</template>
