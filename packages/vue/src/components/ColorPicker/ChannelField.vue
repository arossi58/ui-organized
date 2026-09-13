<!--
  One field of the notation row: a small `Input` with the channel's
  abbreviation printed underneath it.

  It is the library's own `Input` rather than a bare `<input>` styled to look
  like one, so a control inside the popup picks up the same surface, hairline,
  radius, focus ring and disabled treatment as every other field in the system —
  and keeps them when that chrome moves.
-->
<script setup lang="ts">
import { computed, ref } from "vue";
import type { ColorField } from "@ui-organized/core";
import Input from "../Input/Input.vue";
import { readField, writeField, type ColorLike } from "./channelFields.js";

const props = defineProps<{
  field: ColorField;
  color: ColorLike;
  disabled?: boolean;
  readOnly?: boolean;
}>();
const emit = defineEmits<{ commit: [next: ColorLike] }>();

/* `null` means "show the colour". A string means the reader is mid-edit, and
   the colour must not overwrite what they are typing — which it otherwise
   would on every pointer move over the area behind the field. */
const draft = ref<string | null>(null);

const numeric = computed(() => props.field.kind === "channel");
const shown = computed(() => draft.value ?? readField(props.field, props.color));

function commit() {
  if (draft.value === null) return;
  const next = writeField(props.field, draft.value, props.color);
  draft.value = null;
  if (next) emit("commit", next);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    event.preventDefault();
    commit();
  } else if (event.key === "Escape") {
    // Abandon the edit without closing the picker under it.
    event.stopPropagation();
    draft.value = null;
  }
}
</script>

<template>
  <div class="color-picker__field">
    <Input
      size="sm"
      :type="numeric ? 'number' : 'text'"
      :inputmode="numeric ? 'decimal' : 'text'"
      :aria-label="field.label"
      spellcheck="false"
      autocomplete="off"
      :disabled="disabled"
      :readonly="readOnly"
      :min="field.kind === 'channel' ? field.min : undefined"
      :max="field.kind === 'channel' ? field.max : undefined"
      :step="field.kind === 'channel' ? field.step : undefined"
      :model-value="shown"
      @update:model-value="draft = $event"
      @focus="($event.target as HTMLInputElement).select()"
      @blur="commit"
      @keydown="onKeydown"
    />
    <!--
      Only the numeric channels are abbreviated. A `HEX` caption under a hex
      field would only repeat the select above it — but the line stays reserved
      in CSS, so switching notation cannot resize the popup out from under the
      pointer.
    -->
    <span v-if="numeric" class="color-picker__field-label" aria-hidden="true">
      {{ field.label }}
    </span>
  </div>
</template>
