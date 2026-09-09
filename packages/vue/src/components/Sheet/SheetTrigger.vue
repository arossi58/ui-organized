<!-- Element that opens the sheet. Pass `asChild` to project a custom element. -->
<script setup lang="ts">
import { computed } from "vue";
import { Dialog as ArkDialog, useDialogContext } from "@ark-ui/vue";
import { popupControls } from "@ui-organized/core";
import { definedOnly } from "../../props.js";

defineProps<{ asChild?: boolean }>();
const dialog = useDialogContext();
// The panel it names is only mounted while open; popupControls drops the
// reference the rest of the time so it cannot dangle.
const controls = computed(() => definedOnly(popupControls(dialog.value.open)));
</script>

<template>
  <ArkDialog.Trigger :as-child="asChild" v-bind="controls"><slot /></ArkDialog.Trigger>
</template>
