<!--
  The top of a page: a breadcrumb trail, the title and description, the
  page's actions, and an optional row of tabs. Slots: `breadcrumbs`,
  `actions`, `tabs`. React's PageHeader renders the same markup.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { PAGE_HEADER_TEXT_CLASS, pageHeaderStyles } from "@ui-organized/core";
import type { PageHeaderProps } from "./PageHeader.types.js";
import "@ui-organized/core/components/PageHeader/PageHeader.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<PageHeaderProps>(), { size: "md", headingLevel: 1, divided: undefined });
const slots = defineSlots<{ breadcrumbs?: () => unknown; actions?: () => unknown; tabs?: () => unknown }>();
const attrs = useAttrs();

const rootClass = computed(() =>
  clsx(
    pageHeaderStyles({ size: props.size, divided: props.divided, tabs: !!slots.tabs }),
    attrs.class as string | undefined,
  ),
);
const text = computed(() => PAGE_HEADER_TEXT_CLASS[props.size]);
</script>

<template>
  <div :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <div v-if="slots.breadcrumbs" class="page-header__breadcrumbs"><slot name="breadcrumbs" /></div>
    <div class="page-header__row">
      <div class="page-header__heading">
        <component :is="`h${headingLevel}`" :class="['page-header__title', text.title]">{{ title }}</component>
        <p v-if="description" :class="['page-header__description', text.description]">{{ description }}</p>
      </div>
      <div v-if="slots.actions" class="page-header__actions"><slot name="actions" /></div>
    </div>
    <div v-if="slots.tabs" class="page-header__tabs"><slot name="tabs" /></div>
  </div>
</template>
