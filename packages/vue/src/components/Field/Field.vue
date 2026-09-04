<!--
  Form field wrapper. Associates a label, control, description and error message
  through Ark UI's Field, so validation state flows to all parts via
  `aria-describedby` / `[data-invalid]`.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Field as ArkField, useFieldsetContext, type UseFieldsetReturn } from "@ark-ui/vue";
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

/**
 * A field inside a disabled `Fieldset` is disabled, and Ark Vue is the one
 * library that does not do this for us.
 *
 * `@ark-ui/react` and `@ark-ui/svelte` both default a field's `disabled` to its
 * enclosing fieldset's — `disabled ?? Boolean(fieldset?.disabled)`. The Vue
 * package's `useField` never reads the fieldset context at all (5.39.0), so
 * without this the fields inside `<Fieldset disabled>` render *ungreyed* while
 * the native `<fieldset disabled>` still makes them dead: controls that look
 * usable and are not, which is worse than either state on its own.
 *
 * Not a suppression of the difference but a fix for it, using Ark Vue's own
 * public context — so this is Ark's value, read one component along. Harmless
 * once upstream catches up: it will be passing the same boolean Ark would have
 * defaulted to.
 *
 * `undefined` rather than `false` when there is no fieldset, so `definedOnly`
 * keeps leaving the prop off entirely and Ark's own default still decides.
 */
const fieldset = useFieldsetContext(undefined) as UseFieldsetReturn | undefined;
const inheritedDisabled = computed(() => (fieldset?.value.disabled ? true : undefined));

const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(fieldStyles({ layout: props.layout }), attrs.class as string),
);
const rootProps = computed(() =>
  definedOnly({
    ...attrs,
    class: undefined,
    invalid: props.invalid,
    disabled: props.disabled ?? inheritedDisabled.value,
    required: props.required,
    readOnly: props.readOnly,
  }),
);
</script>

<template>
  <ArkField.Root :class="rootClass" v-bind="rootProps"><slot /></ArkField.Root>
</template>
