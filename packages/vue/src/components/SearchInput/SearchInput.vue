<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import { Field } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, searchInputFieldStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import FieldError from "../FieldError/FieldError.vue";
import type { SearchInputProps } from "./SearchInput.types.js";
// Shares the Input field surface/state styling; InputAffix.css layers on the
// leading icon and clear button.
import "@ui-organized/core/components/Input/Input.css";
import "@ui-organized/core/components/Input/InputAffix.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts. `clearable` never reaches Ark and its
// documented default is `true`, so it declares that instead.
const props = withDefaults(defineProps<SearchInputProps>(), {
  size: "md",
  clearable: true,
  required: undefined,
  disabled: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string];
  clear: [];
}>();

const attrs = useAttrs();
const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() =>
  typeof props.error === "string" ? props.error : undefined,
);

/**
 * The value the field is actually showing.
 *
 * React has to mirror the value into state and re-sync it from an effect,
 * because a controlled input's value lives outside the component. Here the
 * controlled half is just `modelValue`, and the uncontrolled half is a local
 * mirror seeded from `defaultValue` — which is the only thing the clear button
 * needs, since it has to disappear the moment the field empties either way.
 */
const uncontrolled = ref(props.defaultValue);
const currentValue = computed(() =>
  props.modelValue !== undefined ? props.modelValue : uncontrolled.value,
);
const hasValue = computed(() => String(currentValue.value ?? "").length > 0);
const showClear = computed(() => props.clearable && hasValue.value && !props.disabled);

const rootClass = computed(() =>
  clsx(searchInputFieldStyles({ size: props.size }), attrs.class as string),
);
const controlClass = computed(() =>
  clsx(
    "field__control",
    "field__control--affix-start",
    showClear.value && "field__control--affix-end",
  ),
);
const inputProps = computed(() =>
  definedOnly({
    ...attrs,
    class: undefined,
    required: props.required,
    disabled: props.disabled,
    value: currentValue.value,
  }),
);

const inputEl = ref<HTMLInputElement | null>(null);
/**
 * Ark exposes the rendered element as `$el` rather than forwarding the DOM node
 * itself, so the ref lands on the component and the element is read off it.
 */
function captureInput(instance: unknown) {
  inputEl.value = (instance as { $el?: HTMLInputElement } | null)?.$el ?? null;
}

function onInput(event: Event) {
  const next = (event.target as HTMLInputElement).value;
  uncontrolled.value = next;
  emit("update:modelValue", next);
}

function clear() {
  const el = inputEl.value;
  if (el) {
    // Assigning `.value` fires no event, so a consumer listening on `@input`
    // rather than binding with `v-model` would never learn the field was cleared.
    el.value = "";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();
  }
  uncontrolled.value = "";
  emit("update:modelValue", "");
  emit("clear");
}
</script>

<template>
  <Field.Root :class="rootClass" :invalid="isInvalid">
    <Field.Label v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </Field.Label>
    <div class="input-affix">
      <span class="input-affix__adornment input-affix__adornment--start" aria-hidden="true">
        <Icon name="search" :size="CONTROL_ICON_SIZE[size]" />
      </span>
      <Field.Input
        :ref="captureInput"
        type="search"
        :class="controlClass"
        v-bind="inputProps"
        @input="onInput"
      />
      <!--
        Out of the tab order: the field it clears is the next stop anyway, and a
        control that appears and disappears as you type would otherwise shift the
        tab sequence under the keyboard user mid-word.
      -->
      <button
        v-if="showClear"
        type="button"
        class="input-affix__adornment input-affix__adornment--end input-affix__action"
        aria-label="Clear search"
        :tabindex="-1"
        @click="clear"
      >
        <Icon name="close" :size="CONTROL_ICON_SIZE[size]" />
      </button>
    </div>
    <Field.HelperText v-if="helperText && !isInvalid" class="field__description">
      {{ helperText }}
    </Field.HelperText>
    <Field.ErrorText v-if="isInvalid && errorMessage" as-child>
      <FieldError :message="errorMessage" />
    </Field.ErrorText>
  </Field.Root>
</template>
