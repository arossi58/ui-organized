<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Switch as ArkSwitch } from "@ark-ui/vue";
import { clsx } from "clsx";
import { definedOnly } from "../../props.js";
import { OMIT_ARIA } from "@ui-organized/core";
import type { SwitchProps } from "./Switch.types.js";
import "@ui-organized/core/components/Switch/Switch.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<SwitchProps>(), { checked: undefined });

/**
 * `v-model` for the checked state, plus the same `onCheckedChange` the React
 * package exposes, so code reads the same in either library.
 */
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
const rootClass = computed(() => clsx("switch", attrs.class as string));

// Spread rather than bound one by one: Ark declares `checked` with a default of
// false, so binding `:checked="undefined"` would actively uncheck a switch that
// `defaultChecked` had checked. See ../../props.ts.
const rootProps = computed(() =>
  definedOnly({
    checked: props.checked,
    defaultChecked: props.defaultChecked,
    disabled: props.disabled,
    required: props.required,
    name: props.name,
    id: props.id,
  }),
);
</script>

<!--
  Ark's Switch.Root *is* the <label>, so the wrapper element and the interactive
  root are one and the same.
-->
<template>
  <ArkSwitch.Root
    :class="rootClass"
    v-bind="rootProps"
    @checked-change="
      (details) => {
        emit('update:checked', details.checked);
        emit('checkedChange', details.checked);
      }
    "
  >
    <ArkSwitch.Control class="switch__track">
      <ArkSwitch.Thumb class="switch__thumb" />
    </ArkSwitch.Control>
    <ArkSwitch.Label v-if="label" class="switch__label text-default-body-large">
      {{ label }}
    </ArkSwitch.Label>
    <!--
      Without a `label` the Label part isn't rendered, so Ark's aria-labelledby
      would point at nothing — and a dangling IDREF outranks aria-label.
    -->
    <ArkSwitch.HiddenInput
      v-bind="hiddenInputAria"
    />
  </ArkSwitch.Root>
</template>
