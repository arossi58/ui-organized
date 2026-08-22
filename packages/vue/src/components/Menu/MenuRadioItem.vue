<script setup lang="ts">
import { Menu as ArkMenu } from "@ark-ui/vue";
import type { MenuRadioItemProps } from "./Menu.types.js";
defineProps<MenuRadioItemProps>();
</script>

<template>
  <ArkMenu.RadioItem :value="value" class="menu__item menu__item--check">
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
