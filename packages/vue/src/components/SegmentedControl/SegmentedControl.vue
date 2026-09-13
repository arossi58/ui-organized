<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { SegmentGroup as ArkSegmentGroup } from "@ark-ui/vue";
import { clsx } from "clsx";
import { OMIT_ARIA, segmentedControlStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import type { SegmentedControlProps } from "./SegmentedControl.types.js";
import "@ui-organized/core/components/SegmentedControl/SegmentedControl.css";

/** Leading icons render at 16px across every size. */
const ICON_SIZE = 16;

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<SegmentedControlProps>(), {
  size: "md",
  disabled: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string];
  valueChange: [value: string];
}>();

const attrs = useAttrs();

// Declared as `ariaLabel` — see the prop's doc comment for why the hyphenated
// spelling cannot work. `attrs` is still checked, for a consumer who spreads the
// attribute in from a wrapper that does not declare it.
const ariaLabel = computed(() => props.ariaLabel ?? (attrs["aria-label"] as string | undefined));

/**
 * The control is named by `aria-label`; it renders no Label part, so Ark's
 * `aria-labelledby` would point at an element that never exists — and a dangling
 * IDREF outranks the label that is actually there.
 *
 * Spread rather than bound one by one: in Vue an explicit `:aria-label="undefined"`
 * *removes* an attribute rather than leaving it alone. See ../../props.ts.
 */
const rootAria = computed(() =>
  definedOnly({ "aria-labelledby": OMIT_ARIA, "aria-label": ariaLabel.value }),
);

// Uncontrolled controls default to the first segment so the indicator has a
// starting position; ignored when a controlled value is supplied.
const resolvedDefault = computed(() =>
  props.modelValue == null ? (props.defaultValue ?? props.items[0]?.value) : undefined,
);
const rootClass = computed(() =>
  clsx(segmentedControlStyles({ size: props.size }), attrs.class as string),
);
const rootProps = computed(() =>
  definedOnly({
    modelValue: props.modelValue,
    defaultValue: resolvedDefault.value,
    disabled: props.disabled,
    name: props.name,
  }),
);
const isString = (v: unknown) => typeof v === "string";

// Written here rather than inline: a Vue template expression cannot carry an
// object type annotation, and the handler's details argument needs one.
function onValueChange(details: { value: string | null }) {
  if (details.value != null) {
    emit("update:modelValue", details.value);
    emit("valueChange", details.value);
  }
}
</script>

<template>
  <ArkSegmentGroup.Root
    orientation="horizontal"
    :class="rootClass"
    v-bind="{ ...rootProps, ...rootAria }"
    @value-change="onValueChange"
  >
    <!-- Sliding highlight behind the selected segment. -->
    <ArkSegmentGroup.Indicator class="segmented__indicator" />
    <ArkSegmentGroup.Item
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      :disabled="item.disabled"
      class="segmented__item"
    >
      <Icon v-if="item.icon" :name="item.icon" :size="ICON_SIZE" class="segmented__item-icon" />
      <ArkSegmentGroup.ItemText class="segmented__item-text">
        <template v-if="isString(item.label)">{{ item.label }}</template>
        <component :is="item.label" v-else />
      </ArkSegmentGroup.ItemText>
      <ArkSegmentGroup.ItemHiddenInput />
    </ArkSegmentGroup.Item>
  </ArkSegmentGroup.Root>
</template>
