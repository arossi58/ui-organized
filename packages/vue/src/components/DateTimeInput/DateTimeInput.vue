<!--
  A single-line date-and-time field — native `<input type="datetime-local">` on
  the Input field surface, with a leading calendar button that opens the DS
  calendar popover (with a time field beneath it) or the browser's own date/time
  picker on touch.
-->
<script setup lang="ts">
import DateFieldBase from "../DateField/DateFieldBase.vue";
import type { DateTimeInputProps } from "./DateTimeInput.types.js";

// Every boolean forwarded on must default to `undefined`. Vue casts an absent
// Boolean prop to `false`, and the base cannot tell that apart from a deliberate
// one — see ../../props.ts.
const props = withDefaults(defineProps<DateTimeInputProps>(), {
  required: undefined,
  disabled: undefined,
});
/** See DateInput.vue for why this listener is re-emitted rather than forwarded. */
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template>
  <DateFieldBase
    type="datetime-local"
    picker-label="Choose date and time"
    v-bind="props"
    @update:model-value="(value: string) => emit('update:modelValue', value)"
  />
</template>
