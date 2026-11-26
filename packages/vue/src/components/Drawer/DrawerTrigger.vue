<!-- Element that opens the drawer. Pass `asChild` to project a custom element. -->
<script setup lang="ts">
import { computed } from "vue";
import { Drawer as ArkDrawer, useDrawerContext } from "@ark-ui/vue";
import { popupControls } from "@ui-organized/core";
import { definedOnly } from "../../props.js";

defineProps<{ asChild?: boolean }>();
const drawer = useDrawerContext();
// The panel it names is only mounted while open; popupControls drops the
// reference the rest of the time so it cannot dangle.
const controls = computed(() => definedOnly(popupControls(drawer.value.open)));
</script>

<template>
  <ArkDrawer.Trigger :as-child="asChild" v-bind="controls"><slot /></ArkDrawer.Trigger>
</template>
