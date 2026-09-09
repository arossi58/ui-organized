<script setup lang="ts">
import { computed, useId } from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import type { ContextMenuCheckboxItemProps } from "./ContextMenu.types.js";

const props = withDefaults(defineProps<ContextMenuCheckboxItemProps>(), {
  checked: undefined,
  disabled: undefined,
});
const emit = defineEmits<{
  "update:checked": [checked: boolean];
  checkedChange: [checked: boolean];
}>();
const generatedId = useId();
const isChecked = computed(() => props.checked ?? false);
const itemProps = computed(() => definedOnly({ disabled: props.disabled }));
</script>

<template>
  <ArkMenu.CheckboxItem
    :value="value ?? generatedId"
    :checked="isChecked"
    v-bind="itemProps"
    class="context-menu__item context-menu__item--check"
    @checked-change="
      (next: boolean) => {
        emit('update:checked', next);
        emit('checkedChange', next);
      }
    "
  >
    <!--
      Design-system Checkbox control; checked state is driven by the item's
      data-state (see ContextMenu.css), not by the CheckboxItem indicator.
    -->
    <span class="checkbox__control context-menu__control">
      <span class="checkbox__indicator">
        <Icon name="check" :size="16" class="checkbox__check" />
      </span>
    </span>
    <span class="context-menu__item-label"><slot /></span>
  </ArkMenu.CheckboxItem>
</template>
