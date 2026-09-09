<script setup lang="ts">
import { computed } from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import type { MenuRadioGroupProps } from "./Menu.types.js";

const props = defineProps<MenuRadioGroupProps>();
const emit = defineEmits<{ "update:modelValue": [value: string]; valueChange: [value: string] }>();
/**
 * `modelValue`, not `value`.
 *
 * Ark's Vue radio group is `v-model`-shaped where its React counterpart takes
 * `value` + `onValueChange(details)` — so this passes `modelValue` through and
 * listens for `update:modelValue`, which hands back a plain string rather than a
 * details object. Passing `value` here, as this did, meant the chosen item never
 * reached Ark and no change ever came back: the group rendered but did nothing.
 */
const groupProps = computed(() => definedOnly({ modelValue: props.modelValue }));

function onValueChange(value: string) {
  emit("update:modelValue", value);
  emit("valueChange", value);
}
</script>

<template>
  <ArkMenu.RadioItemGroup v-bind="groupProps" @update:model-value="onValueChange">
    <slot />
  </ArkMenu.RadioItemGroup>
</template>
