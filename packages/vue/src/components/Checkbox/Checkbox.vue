<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Checkbox as ArkCheckbox } from "@ark-ui/vue";
import { clsx } from "clsx";
import { definedOnly } from "../../props.js";
import { OMIT_ARIA } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import type { CheckboxProps } from "./Checkbox.types.js";
import "@ui-organized/core/components/Checkbox/Checkbox.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<CheckboxProps>(), {
  checked: undefined,
  defaultChecked: undefined,
  disabled: undefined,
  required: undefined,
});
/**
 * `checked` is a plain prop plus an `update:checked` emit rather than
 * `defineModel`, and its `undefined` default is load-bearing.
 *
 * Vue casts an *absent* Boolean prop to `false` rather than leaving it
 * undefined, unless the prop declares a default. Without one, `checked` arrives
 * as `false` on a control nobody is controlling, Ark reads that as "controlled
 * and off", and `defaultChecked` is silently overridden — it renders unchecked
 * and nothing reports a problem. `defineModel` gives no way to declare that
 * default (its runtime options do not accept one), so the prop and emit are
 * written out. `v-model:checked` still works: that is exactly what it compiles
 * to.
 *
 * This is the third shape of the same Vue rule — see ../../props.ts.
 */
const emit = defineEmits<{
  "update:checked": [checked: boolean];
  checkedChange: [checked: boolean];
}>();

const attrs = useAttrs();

// Declared as `ariaLabel` — see the prop's doc comment for why the hyphenated
// spelling cannot work. `attrs` is still checked, for a consumer who spreads the
// attribute in from a wrapper that does not declare it.
const ariaLabel = computed(
  () => props.ariaLabel ?? (attrs["aria-label"] as string | undefined),
);

/**
 * The ARIA overrides for the hidden input, as an object that is *empty* when a
 * label exists.
 *
 * This cannot be written the way React and Svelte write it. There, passing
 * `undefined` means "I am not setting this" and zag's mergeProps keeps the
 * machine's value. Vue's attribute merge is last-wins and not undefined-aware,
 * so an explicit `:aria-labelledby="undefined"` *removes* the reference Ark just
 * computed — silently, and only in the case where the label exists and the
 * reference was correct. The only way to leave an attribute alone in Vue is not
 * to pass it, hence spreading a conditional object.
 */
const hiddenInputAria = computed(() =>
  props.label
    ? {}
    : definedOnly({ "aria-labelledby": OMIT_ARIA, "aria-label": ariaLabel.value }),
);
const rootClass = computed(() =>
  clsx("checkbox", props.disabled && "checkbox--disabled", attrs.class as string),
);

// Ark folds indeterminate into the checked value rather than taking it as a
// separate prop, so the facade translates it at the boundary — and back again in
// the callback, where only a true `true` counts as checked.
/**
 * Ark's checked state, spelled out rather than imported from @zag-js/checkbox —
 * that is a transitive dependency of Ark, not one this package declares, and
 * reaching into it to borrow a two-member union would couple us to Ark's
 * internals for no benefit.
 */
type CheckedState = boolean | "indeterminate";

const arkChecked = computed<CheckedState | undefined>(() =>
  props.indeterminate ? "indeterminate" : props.checked,
);

// Spread rather than bound one by one — see ../../props.ts. Ark declares
// `checked` with a default, so an explicit undefined would override
// `defaultChecked` rather than defer to it.
const rootProps = computed(() =>
  definedOnly({
    checked: arkChecked.value,
    defaultChecked: props.defaultChecked,
    disabled: props.disabled,
    required: props.required,
    name: props.name,
    id: props.id,
  }),
);
</script>

<!-- Ark's Checkbox.Root *is* the <label>. -->
<template>
  <ArkCheckbox.Root
    :class="rootClass"
    v-bind="rootProps"
    @checked-change="
      (details) => {
        emit('update:checked', details.checked === true);
        emit('checkedChange', details.checked === true);
      }
    "
  >
    <ArkCheckbox.Control class="checkbox__control">
      <ArkCheckbox.Indicator class="checkbox__indicator">
        <span v-if="indeterminate" class="checkbox__indicator--indeterminate" />
        <Icon v-else name="check" :size="16" class="checkbox__check" />
      </ArkCheckbox.Indicator>
    </ArkCheckbox.Control>
    <ArkCheckbox.Label v-if="label" class="checkbox__label text-default-body-large">
      {{ label }}
    </ArkCheckbox.Label>
    <!--
      Ark points the input at the Label part unconditionally. With no `label`
      there is no such element, so the reference dangles — and a dangling
      aria-labelledby outranks aria-label, leaving the box nameless.
    -->
    <ArkCheckbox.HiddenInput
      v-bind="hiddenInputAria"
    />
  </ArkCheckbox.Root>
</template>
