<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { TagsInput as ArkTagsInput } from "@ark-ui/vue";
import { clsx } from "clsx";
import { tagsInputStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import FieldError from "../FieldError/FieldError.vue";
import type { TagsInputProps } from "./TagsInput.types.js";
import "@ui-organized/core/components/TagsInput/TagsInput.css";

/** Delete affordance inside a tag — always the small edge, at every control
 *  size, because it sits inside the chip rather than beside it. */
const DELETE_ICON_SIZE = 12;

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — `editable` defaults to *true* in the machine, so a cast
// would silently turn in-place editing off. See ../../props.ts.
const props = withDefaults(defineProps<TagsInputProps>(), {
  editable: undefined,
  addOnPaste: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  valueChange: [value: string[]];
}>();

const attrs = useAttrs();

const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));
const rootClass = computed(() =>
  clsx(tagsInputStyles({ size: props.size }), attrs.class as string),
);

const rootProps = computed(() =>
  definedOnly({
    modelValue: props.modelValue,
    defaultValue: props.defaultValue,
    max: props.max,
    editable: props.editable,
    delimiter: props.delimiter,
    addOnPaste: props.addOnPaste,
    required: props.required,
    disabled: props.disabled,
    readOnly: props.readOnly,
    name: props.name,
  }),
);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handler's details argument needs one.
function onValueChange(details: { value: string[] }) {
  emit("update:modelValue", details.value);
  emit("valueChange", details.value);
}
</script>

<template>
  <ArkTagsInput.Root
    :class="rootClass"
    :invalid="isInvalid"
    v-bind="rootProps"
    @value-change="onValueChange"
  >
    <ArkTagsInput.Label v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </ArkTagsInput.Label>
    <ArkTagsInput.Control class="tags-input__control">
      <!--
        The tags are machine state, not children, so the list is read back from
        the context rather than mapped over the `modelValue` prop — that keeps
        in-place editing (ItemInput) working on the machine's copy.
      -->
      <ArkTagsInput.Context v-slot="api">
        <ArkTagsInput.Item
          v-for="(tag, index) in api.value"
          :key="`${tag}-${index}`"
          :index="index"
          :value="tag"
        >
          <ArkTagsInput.ItemPreview class="tags-input__tag">
            <ArkTagsInput.ItemText class="tags-input__tag-label">{{ tag }}</ArkTagsInput.ItemText>
            <ArkTagsInput.ItemDeleteTrigger class="tags-input__tag-delete">
              <Icon name="close" :size="DELETE_ICON_SIZE" />
            </ArkTagsInput.ItemDeleteTrigger>
          </ArkTagsInput.ItemPreview>
          <ArkTagsInput.ItemInput class="tags-input__tag-input" />
        </ArkTagsInput.Item>
      </ArkTagsInput.Context>
      <ArkTagsInput.Input class="tags-input__entry" :placeholder="placeholder" />
    </ArkTagsInput.Control>
    <span v-if="helperText && !isInvalid" class="field__description">{{ helperText }}</span>
    <FieldError v-if="isInvalid && errorMessage" :message="errorMessage" />
    <ArkTagsInput.HiddenInput />
  </ArkTagsInput.Root>
</template>
