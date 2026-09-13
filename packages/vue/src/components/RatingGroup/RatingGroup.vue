<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { RatingGroup as ArkRatingGroup } from "@ark-ui/vue";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, ratingGroupStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import FieldError from "../FieldError/FieldError.vue";
import type { RatingGroupProps } from "./RatingGroup.types.js";
import "@ui-organized/core/components/RatingGroup/RatingGroup.css";

const DEFAULT_COUNT = 5;

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<RatingGroupProps>(), {
  count: DEFAULT_COUNT,
  size: "md",
  allowHalf: undefined,
  readOnly: undefined,
  disabled: undefined,
  required: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: number];
  valueChange: [value: number];
}>();

const attrs = useAttrs();

const isInvalid = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : undefined));
const iconSize = computed(() => CONTROL_ICON_SIZE[props.size]);
const rootClass = computed(() =>
  clsx(ratingGroupStyles({ size: props.size, variant: props.variant }), attrs.class as string),
);

// The machine has no `invalid` prop — the error state is presentational here,
// which is why it is read for the message and the helper text but not forwarded.
const rootProps = computed(() =>
  definedOnly({
    modelValue: props.modelValue,
    defaultValue: props.defaultValue,
    allowHalf: props.allowHalf,
    readOnly: props.readOnly,
    disabled: props.disabled,
    required: props.required,
    name: props.name,
  }),
);

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handler's details argument needs one.
function onValueChange(details: { value: number }) {
  emit("update:modelValue", details.value);
  emit("valueChange", details.value);
}
</script>

<template>
  <ArkRatingGroup.Root
    :class="rootClass"
    :count="count"
    v-bind="rootProps"
    @value-change="onValueChange"
  >
    <ArkRatingGroup.Label v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true" />
    </ArkRatingGroup.Label>
    <ArkRatingGroup.Control class="rating-group__control">
      <!--
        `api.items` is the machine's index list — the source of truth for how
        many stars exist, so `count` never has to be walked twice.
      -->
      <ArkRatingGroup.Context v-slot="api">
        <ArkRatingGroup.Item
          v-for="index in api.items"
          :key="index"
          :index="index"
          class="rating-group__item"
        >
          <Icon name="star" :size="iconSize" class="rating-group__star" />
          <!--
            The half state is a clipped copy laid over the empty star. Ark sets
            data-half on the item; the width is what does the clipping, so the
            two stars stay pixel-aligned.
          -->
          <span v-if="allowHalf" class="rating-group__half" aria-hidden="true">
            <Icon name="star" :size="iconSize" class="rating-group__star" />
          </span>
        </ArkRatingGroup.Item>
      </ArkRatingGroup.Context>
    </ArkRatingGroup.Control>
    <span v-if="helperText && !isInvalid" class="field__description">{{ helperText }}</span>
    <FieldError v-if="isInvalid && errorMessage" :message="errorMessage" />
    <ArkRatingGroup.HiddenInput />
  </ArkRatingGroup.Root>
</template>
