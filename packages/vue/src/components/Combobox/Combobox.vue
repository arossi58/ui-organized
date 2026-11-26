<script setup lang="ts">
import { computed, ref, useAttrs, onMounted } from "vue";
import { Combobox as ArkCombobox, Field, createListCollection, useFilter } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, comboboxFieldStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import FieldError from "../FieldError/FieldError.vue";
import SelectedLabelSync from "./SelectedLabelSync.vue";
import ComboboxTags from "./ComboboxTags.vue";
import ComboboxMultiParts from "./ComboboxMultiParts.vue";
import type { ComboboxProps } from "./Combobox.types.js";
// The shared field chrome, ahead of this component's own sheet, which may override it.
import "@ui-organized/core/components/Field/Field.css";
import "@ui-organized/core/components/Combobox/Combobox.css";
import { glyph } from "../../icons/glyph.js";
import { trackFocusModality } from "@ui-organized/core/focus-modality";

// Text fields read pointer vs keyboard for a quiet focus state on click.
onMounted(() => trackFocusModality());

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<ComboboxProps>(), {
  emptyMessage: "No results found.",
  open: undefined,
  defaultOpen: undefined,
  disabled: undefined,
  required: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string];
  valueChange: [value: string];
  "update:values": [values: string[]];
  valuesChange: [values: string[]];
  openChange: [open: boolean];
}>();

const attrs = useAttrs();
const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));
const iconSize = computed(() => CONTROL_ICON_SIZE[props.size ?? "md"]);
const rootClass = computed(() =>
  clsx(comboboxFieldStyles({ size: props.size }), attrs.class as string),
);

// Ark does not filter for us: mirror the input text and rebuild the collection
// from the matching options. Rendering items from `collection.items` keeps the
// rendered list and the machine's collection in step.
const filter = useFilter({ sensitivity: "base" });
const query = ref("");

const collection = computed(() =>
  createListCollection({
    items: query.value.trim().length
      ? props.options.filter((o) => filter.value.contains(o.label, query.value))
      : props.options,
    itemToValue: (o) => o.value,
    itemToString: (o) => o.label,
    isItemDisabled: (o) => !!o.disabled,
  }),
);

// Ark Vue names its controlled value `modelValue` and takes an array. See
// Progress for the same rename.
const rootProps = computed(() =>
  definedOnly({
    multiple: props.multiple || undefined,
    modelValue: props.multiple
      ? props.values
      : props.modelValue != null
        ? [props.modelValue]
        : undefined,
    defaultValue: props.multiple
      ? props.defaultValues
      : props.defaultValue != null
        ? [props.defaultValue]
        : undefined,
    // Multiple: the query clears after each pick and the list stays open.
    selectionBehavior: props.multiple ? ("clear" as const) : undefined,
    closeOnSelect: props.multiple ? false : undefined,
    open: props.open,
    defaultOpen: props.defaultOpen,
    disabled: props.disabled,
    // Multiple submits its own hidden inputs; the text box holds the query.
    name: props.multiple ? undefined : props.name,
    required: props.multiple ? undefined : props.required,
  }),
);
// The Control part, so a click on a tag's remove button counts as inside the
// field rather than outside the list.
const control = ref<{ $el?: HTMLElement } | null>(null);
function onValueChange(details: { value: string[] }) {
  if (props.multiple) {
    emit("update:values", details.value);
    emit("valuesChange", details.value);
    return;
  }
  const next = details.value[0] ?? "";
  emit("update:modelValue", next);
  emit("valueChange", next);
}
function onInteractOutside(event: { target: EventTarget | null; preventDefault(): void }) {
  if (props.multiple && control.value?.$el?.contains(event.target as Node)) event.preventDefault();
}
</script>

<template>
  <Field.Root :class="rootClass" :invalid="isInvalid" :disabled="disabled">
    <!--
      Ark Combobox.Root renders a wrapping <div>; `display:contents` keeps the
      label, control and helper as direct flex children of the field.
    -->
    <ArkCombobox.Root
      class="combobox-field__root"
      :collection="collection"
      v-bind="rootProps"
      :invalid="isInvalid"
      :positioning="{ placement: 'bottom-start', gutter: 4, strategy: 'fixed' }"
      @value-change="onValueChange"
      @interact-outside="onInteractOutside"
      @input-value-change="(details) => (query = details.inputValue)"
      @open-change="(details) => emit('openChange', details.open)"
    >
      <SelectedLabelSync v-if="!multiple" :options="options" />
      <ArkCombobox.Label v-if="label" class="field__label">
        {{ label }}
        <span v-if="required" class="field__required" aria-hidden="true" />
      </ArkCombobox.Label>
      <ArkCombobox.Control ref="control" class="combobox-field__control">
        <ComboboxTags v-if="multiple" :options="options" />
        <ComboboxMultiParts v-if="multiple" part="input" :placeholder="placeholder" />
        <ArkCombobox.Input
          v-else
          class="field__control combobox-field__input"
          :placeholder="placeholder"
        />
        <ArkCombobox.ClearTrigger
          v-if="multiple"
          class="combobox-field__clear"
          :aria-label="clearLabel ?? 'Clear all'"
        >
          <Icon :name="glyph('close')" :size="16" />
        </ArkCombobox.ClearTrigger>
        <ArkCombobox.Trigger class="combobox-field__trigger" aria-label="Toggle options">
          <Icon :name="glyph('chevron-down')" :size="iconSize" />
        </ArkCombobox.Trigger>
      </ArkCombobox.Control>
      <!-- Vue has no Ark Portal component — Teleport is built into the framework. -->
      <Teleport :to="portalContainer ?? 'body'">
        <ArkCombobox.Positioner class="combobox-positioner">
          <ArkCombobox.Content class="combobox-popup">
            <ArkCombobox.Empty class="combobox-popup__empty text-default-body-medium">
              {{ emptyMessage }}
            </ArkCombobox.Empty>
            <!--
              Items sit directly in Content, which is itself the listbox —
              Combobox.List is a second labelled wrapper for the non-composite
              mode, and in between it reads as a child of the listbox that isn't
              an option.
            -->
            <ArkCombobox.Item
              v-for="item in collection.items"
              :key="item.value"
              :item="item"
              class="combobox-popup__item text-default-body-large"
            >
              <span class="combobox-popup__item-label">{{ item.label }}</span>
              <ArkCombobox.ItemIndicator class="combobox-popup__item-indicator">
                <Icon :name="glyph('check')" :size="iconSize" />
              </ArkCombobox.ItemIndicator>
            </ArkCombobox.Item>
          </ArkCombobox.Content>
        </ArkCombobox.Positioner>
      </Teleport>
      <ComboboxMultiParts v-if="multiple && name" part="values" :name="name" />
    </ArkCombobox.Root>
    <Field.HelperText v-if="helperText && !isInvalid" class="field__description">
      {{ helperText }}
    </Field.HelperText>
    <Field.ErrorText v-if="isInvalid && errorMessage" as-child>
      <FieldError :message="errorMessage" />
    </Field.ErrorText>
  </Field.Root>
</template>
