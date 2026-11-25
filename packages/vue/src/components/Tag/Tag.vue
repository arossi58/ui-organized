<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { resolveTagAppearance, tagStyles } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import { glyph } from "../../icons/glyph.js";
import type { TagProps } from "./Tag.types.js";
import "@ui-organized/core/components/Tag/Tag.css";

/** Icons render at 16px across every tag size. */
const ICON_SIZE = 16;
/** The remove glyph is smaller than a content icon, so it reads as a control beside the label. */
const REMOVE_ICON_SIZE = 12;
const CLOSE = glyph("close");

defineOptions({ inheritAttrs: false });
// `emphasized` keeps its `true` default: Vue casts an absent boolean prop to
// `false`, which would turn every Tag that never mentions it subtle.
const props = withDefaults(defineProps<TagProps>(), {
  emphasized: true,
  dot: false,
  removable: false,
  iconPosition: "left",
});
const emit = defineEmits<{ remove: [event: MouseEvent] }>();
const attrs = useAttrs();
const rootClass = computed(() =>
  clsx(
    tagStyles({
      variant: props.variant,
      size: props.size,
      appearance: resolveTagAppearance(props.appearance, props.emphasized),
      shape: props.shape,
    }),
    attrs.class as string,
  ),
);
</script>

<template>
  <span :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <span v-if="dot" class="tag__dot" aria-hidden="true" />
    <Icon v-if="icon && iconPosition === 'left'" :name="icon" :size="ICON_SIZE" class="tag__icon" />
    <span class="tag__label"><slot /></span>
    <Icon v-if="icon && iconPosition === 'right'" :name="icon" :size="ICON_SIZE" class="tag__icon" />
    <button
      v-if="removable"
      type="button"
      class="tag__remove"
      :aria-label="removeLabel"
      @click="emit('remove', $event)"
    >
      <Icon :name="CLOSE" :size="REMOVE_ICON_SIZE" />
    </button>
  </span>
</template>
