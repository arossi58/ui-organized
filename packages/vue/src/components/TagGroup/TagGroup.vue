<!--
  The announcement pill: a short tag and a message in one pill, "New ▸ We've
  shipped dark mode". With `href` the whole pill is one link.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import {
  TAG_GROUP_ICON_SIZE,
  TAG_GROUP_TAG_SIZE,
  TAG_GROUP_TEXT_CLASS,
  tagGroupStyles,
} from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import Tag from "../Tag/Tag.vue";
import { glyph } from "../../icons/glyph.js";
import type { TagGroupProps } from "./TagGroup.types.js";
import "@ui-organized/core/components/TagGroup/TagGroup.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<TagGroupProps>(), {
  variant: "brand",
  size: "md",
  tagPosition: "leading",
});
const attrs = useAttrs();
const classes = computed(() =>
  clsx(tagGroupStyles({ variant: props.variant, size: props.size, tagPosition: props.tagPosition }), attrs.class as string | undefined),
);
const trailingIcon = computed(() => props.icon ?? (props.href !== undefined ? glyph("chevron-right") : undefined));
const isLink = computed(() => props.href !== undefined);
</script>

<template>
  <component
    :is="isLink ? 'a' : 'span'"
    :class="classes"
    :href="href"
    :target="target"
    :rel="rel"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <Tag v-if="tagPosition === 'leading'" :variant="variant" :size="TAG_GROUP_TAG_SIZE[size]" shape="pill" class="tag-group__tag">{{ tag }}</Tag>
    <span :class="['tag-group__message', TAG_GROUP_TEXT_CLASS[size]]"><slot /></span>
    <Tag v-if="tagPosition === 'trailing'" :variant="variant" :size="TAG_GROUP_TAG_SIZE[size]" shape="pill" class="tag-group__tag">{{ tag }}</Tag>
    <Icon v-if="trailingIcon" :name="trailingIcon" :size="TAG_GROUP_ICON_SIZE[size]" class="tag-group__icon" />
  </component>
</template>
