<script setup lang="ts">
import { computed } from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import type { MenuRadioGroupProps } from "./Menu.types.js";

const props = defineProps<MenuRadioGroupProps>();
const emit = defineEmits<{ "update:modelValue": [value: string]; valueChange: [value: string] }>();
const groupProps = computed(() => definedOnly({ value: props.modelValue }));

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handler's details argument needs one.
function onValueChange(details: { value: string }) {
  emit("update:modelValue", details.value);
  emit("valueChange", details.value);
}
</script>

<template>
  <ArkMenu.RadioItemGroup v-bind="groupProps" @value-change="onValueChange">
    <slot />
  </ArkMenu.RadioItemGroup>
</template>
