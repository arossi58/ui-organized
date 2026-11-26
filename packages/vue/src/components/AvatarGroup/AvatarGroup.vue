<!--
  Overlapping avatars for the people on something, with a `+N` for the rest.
  Data-driven, as in every library, because Svelte snippets can't be counted.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { avatarGroupStyles, avatarStyles, defaultAvatarGroupMoreLabel, splitAvatarGroup } from "@ui-organized/core";
import Avatar from "../Avatar/Avatar.vue";
import type { AvatarGroupProps } from "./AvatarGroup.types.js";
import "@ui-organized/core/components/AvatarGroup/AvatarGroup.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<AvatarGroupProps>(), { size: "md", moreLabel: defaultAvatarGroupMoreLabel });
const attrs = useAttrs();
const split = computed(() => splitAvatarGroup(props.items, props.max));
const rootClass = computed(() => clsx(avatarGroupStyles({ size: props.size }), attrs.class as string | undefined));
const overflowClass = computed(() => clsx(avatarStyles({ size: props.size, shape: props.shape }), "avatar-group__overflow"));
</script>

<template>
  <div :class="rootClass" role="group" :aria-label="label" v-bind="{ ...$attrs, class: undefined }">
    <Avatar
      v-for="(item, index) in split.shown"
      :key="item.name ?? index"
      :size="size"
      :shape="shape"
      :src="item.src"
      :name="item.name"
      :alt="item.alt"
    >
      <template v-if="item.fallback" #fallback>{{ item.fallback }}</template>
    </Avatar>
    <span v-if="split.overflow > 0" :class="overflowClass" role="img" :aria-label="moreLabel(split.overflow)">{{ `+${split.overflow}` }}</span>
  </div>
</template>
