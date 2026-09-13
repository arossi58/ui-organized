<!--
  The notation row under the sliders: a format select on a row of its own, and
  the fields for the notation it names underneath it.

  The select is the library's own `Select`, which means the picker opens a
  second surface above the one it is already showing. The dismissable-layer
  stack under all four libraries is built for exactly that — a select opened
  inside a dialog closes itself and leaves the dialog alone — so the picker
  stays open while the notation list is up.

  Which notations exist and which fields each one shows come from
  `COLOR_NOTATIONS` / `COLOR_NOTATION_FIELDS` in `@ui-organized/core`, shared
  with the React, Svelte and Angular pickers so all four offer the same row.
-->
<script setup lang="ts">
import {
  COLOR_NOTATIONS,
  COLOR_NOTATION_FIELDS,
  type ColorNotation,
} from "@ui-organized/core";
import Select from "../Select/Select.vue";
import ChannelField from "./ChannelField.vue";
import type { ColorLike } from "./channelFields.js";

defineProps<{
  format: ColorNotation;
  color: ColorLike;
  disabled?: boolean;
  readOnly?: boolean;
  container?: HTMLElement | null;
}>();
const emit = defineEmits<{
  formatChange: [format: ColorNotation];
  commit: [next: ColorLike];
}>();

const notations = COLOR_NOTATIONS;
const fieldsFor = COLOR_NOTATION_FIELDS;
</script>

<template>
  <div class="color-picker__notation">
    <!--
      The label is rendered and hidden in CSS rather than left off: Ark names
      the trigger, the listbox and the hidden `<select>` after the Label part,
      so an absent label leaves three dangling references behind.
    -->
    <Select
      class="color-picker__format"
      size="sm"
      label="Colour notation"
      :options="notations"
      :model-value="format"
      :disabled="disabled"
      :portal-container="container ?? undefined"
      @update:model-value="emit('formatChange', $event as ColorNotation)"
    />

    <div class="color-picker__inputs" :data-format="format">
      <ChannelField
        v-for="field in fieldsFor[format]"
        :key="field.key"
        :field="field"
        :color="color"
        :disabled="disabled"
        :read-only="readOnly"
        @commit="emit('commit', $event)"
      />
    </div>
  </div>
</template>
