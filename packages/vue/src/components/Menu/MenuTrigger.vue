<!-- Element that opens the menu. Pass `asChild` to project a custom element. -->
<script setup lang="ts">
import { computed } from "vue";
import { Menu as ArkMenu, useMenuContext } from "@ark-ui/vue";
import { popupControls } from "@ui-organized/core";
import { definedOnly } from "../../props.js";

defineProps<{ asChild?: boolean }>();
const menu = useMenuContext();
const controls = computed(() => definedOnly(popupControls(menu.value.open)));
</script>

<template>
  <ArkMenu.Trigger :as-child="asChild" v-bind="controls"><slot /></ArkMenu.Trigger>
</template>
