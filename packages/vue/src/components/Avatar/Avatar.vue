<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue";
import { Avatar as ArkAvatar } from "@ark-ui/vue";
import { clsx } from "clsx";
import { avatarStyles, initials } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import type { AvatarProps } from "./Avatar.types.js";
import "@ui-organized/core/components/Avatar/Avatar.css";

const ICON_SIZE: Record<NonNullable<AvatarProps["size"]>, number> = {
  xs: 14, sm: 16, md: 20, lg: 24, xl: 32,
};

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<AvatarProps>(), { size: "md" });
const attrs = useAttrs();
const slots = useSlots();
const rootClass = computed(() =>
  clsx(avatarStyles({ size: props.size, shape: props.shape }), attrs.class as string),
);
const hasFallbackSlot = computed(() => Boolean(slots.fallback));
</script>

<template>
  <ArkAvatar.Root :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <ArkAvatar.Image v-if="src" :src="src" :alt="alt ?? name" class="avatar__image" />
    <ArkAvatar.Fallback class="avatar__fallback">
      <slot v-if="hasFallbackSlot" name="fallback" />
      <template v-else-if="name">{{ initials(name) }}</template>
      <Icon v-else name="user" :size="ICON_SIZE[size]" />
    </ArkAvatar.Fallback>
  </ArkAvatar.Root>
</template>
