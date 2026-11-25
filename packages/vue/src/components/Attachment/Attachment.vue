<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { clsx } from "clsx";
import { attachmentStyles, clampProgress, formatFileSize } from "@ui-organized/core";
import Icon from "../Icon/Icon.vue";
import { glyph } from "../../icons/glyph.js";
import type { AttachmentProps } from "./Attachment.types.js";
import "@ui-organized/core/components/Attachment/Attachment.css";

// A file, as a row or a chip: name, size or status, progress, and actions.
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<AttachmentProps>(), {
  status: "done",
  variant: "row",
  progressLabel: "Uploading",
});
const attrs = useAttrs();
const pct = computed(() => clampProgress(props.progress));
const meta = computed(() =>
  props.status === "uploading"
    ? pct.value != null
      ? `${props.progressLabel} ${pct.value}%`
      : props.progressLabel
    : props.status === "error"
      ? (props.error ?? "Upload failed")
      : props.size != null
        ? formatFileSize(props.size)
        : null,
);
const retry = computed(() => props.status === "error" && !!props.onRetry);
const rootClass = computed(() => clsx(attachmentStyles({ variant: props.variant }), attrs.class as string));
</script>

<template>
  <div :class="rootClass" :data-status="status" v-bind="{ ...$attrs, class: undefined }">
    <span class="attachment__icon" aria-hidden="true">
      <Icon :name="glyph(status === 'error' ? 'alert-circle' : 'file')" :size="variant === 'chip' ? 16 : 20" />
    </span>
    <span class="attachment__body">
      <a v-if="href" class="attachment__name" :href="href" download>{{ name }}</a>
      <span v-else class="attachment__name">{{ name }}</span>
      <span v-if="meta" class="attachment__meta">{{ meta }}</span>
      <div
        v-if="status === 'uploading' && variant === 'row'"
        class="attachment__progress"
        role="progressbar"
        :aria-label="`${progressLabel} ${name}`"
        :aria-valuemin="0"
        :aria-valuemax="100"
        :aria-valuenow="pct ?? undefined"
      >
        <span class="attachment__progress-bar" :style="{ width: `${pct ?? 0}%` }" />
      </div>
    </span>
    <span v-if="retry || onRemove" class="attachment__actions">
      <button
        v-if="retry"
        type="button"
        class="attachment__action"
        :aria-label="retryLabel ?? `Retry ${name}`"
        @click="onRetry?.()"
      >
        <Icon :name="glyph('refresh')" :size="16" />
      </button>
      <button
        v-if="onRemove"
        type="button"
        class="attachment__action"
        :aria-label="removeLabel ?? `Remove ${name}`"
        @click="onRemove?.()"
      >
        <Icon :name="glyph('close')" :size="16" />
      </button>
    </span>
  </div>
</template>
