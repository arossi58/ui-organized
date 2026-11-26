<!--
  What to show when there is nothing to show: an icon or illustration, a title,
  a line of description and the actions that get the reader out of it.
  Slots: `media` (overrides `icon`) and `actions`.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { EMPTY_STATE_ICON_SIZE, EMPTY_STATE_TEXT_CLASS, emptyStateStyles } from "@ui-organized/core";
import FeaturedIcon from "../FeaturedIcon/FeaturedIcon.vue";
import type { EmptyStateProps } from "./EmptyState.types.js";
import "@ui-organized/core/components/EmptyState/EmptyState.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<EmptyStateProps>(), { size: "md" });
const slots = defineSlots<{ media?: () => unknown; actions?: () => unknown }>();
const attrs = useAttrs();

const rootClass = computed(() => clsx(emptyStateStyles({ size: props.size }), attrs.class as string | undefined));
const text = computed(() => EMPTY_STATE_TEXT_CLASS[props.size]);
const titleTag = computed(() => (props.headingLevel ? `h${props.headingLevel}` : "p"));
</script>

<template>
  <div :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <div v-if="slots.media" class="empty-state__media"><slot name="media" /></div>
    <div v-else-if="icon" class="empty-state__media">
      <FeaturedIcon :icon="icon" variant="neutral" :size="EMPTY_STATE_ICON_SIZE[size]" />
    </div>
    <div class="empty-state__body">
      <component :is="titleTag" :class="['empty-state__title', text.title]">{{ title }}</component>
      <p v-if="description" :class="['empty-state__description', text.description]">{{ description }}</p>
    </div>
    <div v-if="slots.actions" class="empty-state__actions"><slot name="actions" /></div>
  </div>
</template>
