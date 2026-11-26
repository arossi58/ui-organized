<!-- The row that closes a section: the default slot is the status line, `actions` the closing actions. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { SECTION_FOOTER_TEXT_CLASS, sectionFooterStyles } from "@ui-organized/core";
import type { SectionFooterProps } from "./PageHeader.types.js";
import "@ui-organized/core/components/PageHeader/PageHeader.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<SectionFooterProps>(), { divided: undefined });
const slots = defineSlots<{ default?: () => unknown; actions?: () => unknown }>();
const attrs = useAttrs();

const rootClass = computed(() =>
  clsx(sectionFooterStyles({ divided: props.divided }), attrs.class as string | undefined),
);
</script>

<template>
  <div :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <div v-if="slots.default" :class="['section-footer__content', SECTION_FOOTER_TEXT_CLASS]"><slot /></div>
    <div v-if="slots.actions" class="section-footer__actions"><slot name="actions" /></div>
  </div>
</template>
