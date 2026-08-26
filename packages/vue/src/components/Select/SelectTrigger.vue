<!--
  The trigger, split out so it can read the select's open state from context —
  `Select` itself renders the Root, so it sits above that context. React and
  Svelte split it for exactly the same reason.
-->
<script setup lang="ts">
import { computed } from "vue";
import { Select as ArkSelect, useSelectContext } from "@ark-ui/vue";
import { OMIT_ARIA, popupControls } from "@ui-organized/core";
import { definedOnly } from "../../props.js";

const props = defineProps<{ hasLabel: boolean }>();
const select = useSelectContext();

// Spread, not bound: an explicit undefined would strip the machine's own
// aria-labelledby rather than leave it alone. See ../../props.ts.
const triggerAria = computed(() =>
  definedOnly({
    ...popupControls(select.value.open),
    ...(props.hasLabel ? {} : { "aria-labelledby": OMIT_ARIA }),
  }),
);
</script>

<template>
  <ArkSelect.Trigger class="select-field__trigger text-default-body-large" v-bind="triggerAria">
    <slot />
  </ArkSelect.Trigger>
</template>
