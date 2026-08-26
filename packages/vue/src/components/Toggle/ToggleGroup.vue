<!-- Joins a set of `<Toggle>` buttons into one single- or multi-select control. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { ToggleGroup as ArkToggleGroup } from "@ark-ui/vue";
import { clsx } from "clsx";
import { definedOnly } from "../../props.js";
import type { ToggleGroupProps } from "./Toggle.types.js";
import "@ui-organized/core/components/Toggle/Toggle.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined` — see
// ../../props.ts. `multiple: false` happens to agree with Ark's own default, but
// reasoning case by case about which ones matter is exactly what went wrong the
// last time, so the rule is applied to all of them.
const props = withDefaults(defineProps<ToggleGroupProps>(), {
  multiple: undefined,
  disabled: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  valueChange: [value: string[]];
}>();

const attrs = useAttrs();
const rootClass = computed(() => clsx("toggle-group", attrs.class as string));
const rootProps = computed(() =>
  definedOnly({
    modelValue: props.modelValue,
    defaultValue: props.defaultValue,
    multiple: props.multiple,
    disabled: props.disabled,
    orientation: props.orientation,
  }),
);
</script>

<template>
  <ArkToggleGroup.Root
    :class="rootClass"
    v-bind="{ ...rootProps, ...$attrs, class: undefined }"
    @value-change="
      (details) => {
        emit('update:modelValue', details.value);
        emit('valueChange', details.value);
      }
    "
  >
    <slot />
  </ArkToggleGroup.Root>
</template>
