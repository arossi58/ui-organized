<!--
  The multiple-mode text box and hidden values. Backspace in an empty box
  removes the last value; each value is submitted as its own hidden input,
  because the text box holds the query. React's MultiInput and HiddenValues.
-->
<script setup lang="ts">
import { Combobox as ArkCombobox, useComboboxContext } from "@ark-ui/vue";

defineProps<{ part: "input" | "values"; placeholder?: string; name?: string }>();
const combobox = useComboboxContext();

function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Backspace" || combobox.value.inputValue !== "") return;
  const values = combobox.value.value;
  const last = values[values.length - 1];
  if (last != null) combobox.value.clearValue(last);
}
</script>

<template>
  <ArkCombobox.Input
    v-if="part === 'input'"
    class="field__control combobox-field__input"
    :placeholder="combobox.value.length ? undefined : placeholder"
    @keydown="onKeydown"
  />
  <template v-else-if="name">
    <input v-for="v in combobox.value" :key="v" type="hidden" :name="name" :value="v" />
  </template>
</template>
