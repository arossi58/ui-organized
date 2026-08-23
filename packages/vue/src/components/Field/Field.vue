<!--
  Form field wrapper. Associates a label, control, description and error message
  through Ark UI's Field, so validation state flows to all parts via
  `aria-describedby` / `[data-invalid]`.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Field as ArkField } from "@ark-ui/vue";
import { clsx } from "clsx";
import { fieldStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import type { FieldProps } from "./Field.types.js";
import "@ui-organized/core/components/Field/Field.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<FieldProps>(), {
  invalid: undefined,
  disabled: undefined,
  required: undefined,
  readOnly: undefined,
});
const attrs = useAttrs();
const rootClass = computed(() => clsx(fieldStyles({ layout: props.layout }), attrs.class as string));
const rootProps = computed(() =>
  definedOnly({
    ...attrs,
    class: undefined,
    invalid: props.invalid,
    disabled: props.disabled,
    required: props.required,
    readOnly: props.readOnly,
  }),
);
</script>

<template>
  <ArkField.Root :class="rootClass" v-bind="rootProps"><slot /></ArkField.Root>
</template>
