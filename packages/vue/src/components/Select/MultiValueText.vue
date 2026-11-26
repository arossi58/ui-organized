<!--
  The chosen values as text inside the trigger: the placeholder when there are
  none, otherwise visually hidden, because it is what names the selection for a
  screen reader while the tags beside it are aria-hidden.
-->
<script setup lang="ts">
import { Select as ArkSelect, useSelectContext } from "@ark-ui/vue";
import { clsx } from "clsx";

defineProps<{ placeholder?: string }>();
const select = useSelectContext();
</script>

<template>
  <ArkSelect.ValueText
    :class="clsx('select-field__value', select.value.length > 0 && 'select-field__value--hidden')"
    :placeholder="placeholder"
  />
</template>
