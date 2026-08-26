<script setup lang="ts">
import { computed, useId } from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import Icon from "../Icon/Icon.vue";
import type { MenuCheckboxItemProps } from "./Menu.types.js";

const props = withDefaults(defineProps<MenuCheckboxItemProps>(), { checked: undefined });
const emit = defineEmits<{
  "update:checked": [checked: boolean];
  checkedChange: [checked: boolean];
}>();
const generatedId = useId();
const isChecked = computed(() => props.checked ?? false);
</script>

<template>
  <ArkMenu.CheckboxItem
    :value="value ?? generatedId"
    :checked="isChecked"
    class="menu__item menu__item--check"
    @checked-change="
      (next: boolean) => {
        emit('update:checked', next);
        emit('checkedChange', next);
      }
    "
  >
    <!--
      Design-system Checkbox control; checked state is driven by the item's
      data-state (see Menu.css), not by the CheckboxItem indicator.
    -->
    <span class="checkbox__control menu__control">
      <span class="checkbox__indicator">
        <Icon name="check" :size="16" class="checkbox__check" />
      </span>
    </span>
    <span class="menu__item-label"><slot /></span>
  </ArkMenu.CheckboxItem>
</template>
