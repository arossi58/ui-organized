<!--
  An avatar with a name and a line of supporting text beside it. The avatar is
  hidden from assistive technology, because the name says the same thing; a
  status or verified badge is announced after the name instead.
-->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import {
  AVATAR_LABEL_TEXT_CLASS,
  AVATAR_STATUS_LABEL,
  avatarLabelAnnouncement,
  avatarLabelStyles,
} from "@ui-organized/core";
import Avatar from "../Avatar/Avatar.vue";
import type { AvatarLabelProps } from "./AvatarLabel.types.js";
import "@ui-organized/core/components/AvatarLabel/AvatarLabel.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<AvatarLabelProps>(), { size: "md", verified: false });
const attrs = useAttrs();
const rootClass = computed(() => clsx(avatarLabelStyles({ size: props.size }), attrs.class as string | undefined));
const text = computed(() => AVATAR_LABEL_TEXT_CLASS[props.size]);
const announcement = computed(() =>
  avatarLabelAnnouncement({
    statusLabel: props.status ? (props.statusLabel ?? AVATAR_STATUS_LABEL[props.status]) : undefined,
    verified: props.verified,
    verifiedLabel: props.verifiedLabel,
  }),
);
</script>

<template>
  <div :class="rootClass" v-bind="{ ...$attrs, class: undefined }">
    <Avatar
      aria-hidden="true"
      :size="size"
      :shape="shape"
      :src="src"
      :name="name"
      alt=""
      :status="status"
      :status-label="statusLabel"
      :verified="verified"
      :verified-label="verifiedLabel ?? 'Verified'"
    >
      <template v-if="fallback" #fallback>{{ fallback }}</template>
    </Avatar>
    <div class="avatar-label__text">
      <span :class="['avatar-label__name', text.name]">{{ name }}</span>
      <span v-if="announcement" class="avatar-label__sr">{{ `, ${announcement}` }}</span>
      <span v-if="description" :class="['avatar-label__description', text.description]">{{ description }}</span>
    </div>
  </div>
</template>
