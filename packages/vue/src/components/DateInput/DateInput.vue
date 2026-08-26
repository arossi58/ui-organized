<!--
  A single-line date field — native `<input type="date">` on the Input field
  surface, with a leading calendar button that opens the DS calendar popover
  (fine pointers) or the browser's own date picker (touch).
-->
<script setup lang="ts">
import DateFieldBase from "../DateField/DateFieldBase.vue";
import type { DateInputProps } from "./DateInput.types.js";

// Every boolean forwarded on must default to `undefined`. Vue casts an absent
// Boolean prop to `false`, and the base cannot tell that apart from a deliberate
// one — see ../../props.ts.
const props = withDefaults(defineProps<DateInputProps>(), {
  required: undefined,
  disabled: undefined,
});
/**
 * The v-model listener is re-emitted rather than left to fall through.
 *
 * An undeclared `onUpdate:modelValue` would stay in `$attrs`, and the base
 * spreads its unclaimed attrs onto the native `<input>` — so the listener would
 * land on the DOM element, where nothing ever emits it, and `v-model` on this
 * component would silently never update.
 */
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template>
  <DateFieldBase
    type="date"
    picker-label="Choose date"
    v-bind="props"
    @update:model-value="(value: string) => emit('update:modelValue', value)"
  />
</template>
