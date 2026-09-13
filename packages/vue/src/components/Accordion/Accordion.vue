<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { Accordion as ArkAccordion } from "@ark-ui/vue";
import { clsx } from "clsx";
import { accordionStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import Icon from "../Icon/Icon.vue";
import type { AccordionProps } from "./Accordion.types.js";
import "@ui-organized/core/components/Accordion/Accordion.css";

defineOptions({ inheritAttrs: false });
// Every boolean forwarded to Ark below must default to `undefined`. Vue casts
// an absent Boolean prop to `false`, and `definedOnly` then forwards that as a
// deliberate choice — see ../../props.ts.
const props = withDefaults(defineProps<AccordionProps>(), {
  multiple: true,
  disabled: undefined,
});
const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  valueChange: [value: string[]];
}>();

const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(accordionStyles({ variant: props.variant, size: props.size }), attrs.class as string),
);
const rootProps = computed(() =>
  definedOnly({
    value: props.modelValue?.map(String),
    defaultValue: props.defaultValue?.map(String),
    disabled: props.disabled,
  }),
);
const isString = (v: unknown) => typeof v === "string";
</script>

<!--
  `collapsible` is derived rather than exposed: in single mode it keeps the
  behaviour of closing the open item by clicking it again, which zag already
  implies when `multiple` is set.
-->
<template>
  <ArkAccordion.Root
    :multiple="multiple"
    :collapsible="!multiple"
    v-bind="rootProps"
    :class="rootClass"
    @value-change="
      (details) => {
        emit('update:modelValue', details.value);
        emit('valueChange', details.value);
      }
    "
  >
    <ArkAccordion.Item
      v-for="item in items"
      :key="item.value"
      :value="String(item.value)"
      :disabled="item.disabled"
      class="accordion__item"
    >
      <!--
        Ark has no Header part — wrap the trigger in a heading ourselves so the
        trigger stays inside a heading for assistive tech.
      -->
      <h3 class="accordion__header">
        <ArkAccordion.ItemTrigger class="accordion__trigger">
          <span class="accordion__title">
            <template v-if="isString(item.title)">{{ item.title }}</template>
            <component :is="item.title" v-else />
          </span>
          <Icon name="chevron-down" :size="20" class="accordion__icon" />
        </ArkAccordion.ItemTrigger>
      </h3>
      <ArkAccordion.ItemContent class="accordion__panel text-default-body-medium">
        <div class="accordion__content">
          <template v-if="isString(item.content)">{{ item.content }}</template>
          <component :is="item.content" v-else />
        </div>
      </ArkAccordion.ItemContent>
    </ArkAccordion.Item>
  </ArkAccordion.Root>
</template>
