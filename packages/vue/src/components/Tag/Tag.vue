<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { tagStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import type { TagProps } from "./Tag.types.js";
import "@ui-organized/core/components/Tag/Tag.css";

/** Icons render at 16px across every tag size. */
const ICON_SIZE = 16;

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<TagProps>(), {
  emphasized: true,
  iconPosition: "left",
});
const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(
    tagStyles({ variant: props.variant, size: props.size }),
    !props.emphasized && "tag--subdued",
    attrs.class as string,
  ),
);
</script>

<template>
  <span :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <Icon v-if="icon && iconPosition === 'left'" :name="icon" :size="ICON_SIZE" class="tag__icon" />
    <span class="tag__label"><slot /></span>
    <Icon v-if="icon && iconPosition === 'right'" :name="icon" :size="ICON_SIZE" class="tag__icon" />
  </span>
</template>
