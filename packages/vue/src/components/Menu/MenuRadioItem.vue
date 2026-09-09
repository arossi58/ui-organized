<script setup lang="ts">
import { computed } from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import { definedOnly } from "../../props.js";
import type { MenuRadioItemProps } from "./Menu.types.js";

// `disabled` defaults to `undefined` so an absent prop is left to Ark's own
// default rather than forced to `false` — see ../../props.ts.
const props = withDefaults(defineProps<MenuRadioItemProps>(), { disabled: undefined });
const itemProps = computed(() => definedOnly({ disabled: props.disabled }));
</script>

<template>
  <ArkMenu.RadioItem :value="value" v-bind="itemProps" class="menu__item menu__item--check">
    <!--
      Design-system Radio control; checked state is driven by the item's
      data-state (see Menu.css), not by the RadioItem indicator.
    -->
    <span class="radio-item__control menu__control">
      <span class="radio-item__indicator" />
    </span>
    <span class="menu__item-label"><slot /></span>
  </ArkMenu.RadioItem>
</template>
