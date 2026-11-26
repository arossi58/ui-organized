<!-- A section's title row, one level down from PageHeader. Slot: `actions`. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { SECTION_HEADER_TEXT_CLASS, sectionHeaderStyles } from "@ui-organized/core";
import type { SectionHeaderProps } from "./PageHeader.types.js";
import "@ui-organized/core/components/PageHeader/PageHeader.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<SectionHeaderProps>(), {
  size: "md",
  align: "start",
  headingLevel: 2,
  divided: undefined,
});
const slots = defineSlots<{ actions?: () => unknown }>();
const attrs = useAttrs();

const rootClass = computed(() =>
  clsx(
    sectionHeaderStyles({ size: props.size, align: props.align, divided: props.divided }),
    attrs.class as string | undefined,
  ),
);
const text = computed(() => SECTION_HEADER_TEXT_CLASS[props.size]);
</script>

<template>
  <div :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <div class="section-header__heading">
      <component :is="`h${headingLevel}`" :class="['section-header__title', text.title]">{{ title }}</component>
      <p v-if="description" :class="['section-header__description', text.description]">{{ description }}</p>
    </div>
    <div v-if="slots.actions" class="section-header__actions"><slot name="actions" /></div>
  </div>
</template>
