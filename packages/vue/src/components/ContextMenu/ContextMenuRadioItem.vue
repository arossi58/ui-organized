<script setup lang="ts">
import { computed } from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import type { ContextMenuRadioItemProps } from "./ContextMenu.types.js";

const props = withDefaults(defineProps<ContextMenuRadioItemProps>(), { disabled: undefined });
const itemProps = computed(() => definedOnly({ disabled: props.disabled }));
</script>

<template>
  <ArkMenu.RadioItem
    :value="value"
    v-bind="itemProps"
    class="context-menu__item context-menu__item--check"
  >
    <!--
      Design-system Radio control; checked state is driven by the item's
      data-state (see ContextMenu.css), not by the RadioItem indicator.
    -->
    <span class="radio-item__control context-menu__control">
      <span class="radio-item__indicator" />
    </span>
    <span class="context-menu__item-label"><slot /></span>
  </ArkMenu.RadioItem>
</template>
