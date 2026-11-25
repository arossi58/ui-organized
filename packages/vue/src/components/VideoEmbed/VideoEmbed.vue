<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useAttrs } from "vue";
import { clsx } from "clsx";
import { VIDEO_EMBED_ALLOW, videoEmbedKind, videoEmbedStyles } from "@ui-organized/core";
import Dialog from "../Dialog/Dialog.vue";
import DialogContent from "../Dialog/DialogContent.vue";
import DialogTitle from "../Dialog/DialogTitle.vue";
import type { VideoEmbedProps } from "./VideoEmbed.types.js";
import "@ui-organized/core/components/VideoEmbed/VideoEmbed.css";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<VideoEmbedProps>(), {
  lightbox: false,
  background: false,
  captionsLang: "en",
});
const attrs = useAttrs();

const kind = computed(() => videoEmbedKind(props.src, props.type));
const playing = ref(false);
const open = ref(false);
const media = ref<HTMLVideoElement | HTMLIFrameElement | null>(null);
const rootClass = computed(() =>
  clsx(
    videoEmbedStyles(props.background ? { background: true } : { playing: playing.value && !props.lightbox }),
    attrs.class as string,
  ),
);
const rootStyle = computed(() => (props.aspectRatio ? { aspectRatio: props.aspectRatio } : undefined));
const rest = computed(() => ({ ...attrs, class: undefined }));

// A decorative loop starts after mount, and only without reduced motion, so
// the server and the first client render are the same paused element.
onMounted(() => {
  const video = media.value;
  if (!props.background || !(video instanceof HTMLVideoElement)) return;
  if (typeof window.matchMedia !== "function") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  void video.play?.()?.catch(() => {});
});

async function play() {
  if (props.lightbox) {
    open.value = true;
    return;
  }
  playing.value = true;
  // The poster button is gone once the player replaces it, so focus follows.
  await nextTick();
  media.value?.focus();
}
const setMedia = (el: unknown) => {
  media.value = (el as HTMLVideoElement | HTMLIFrameElement | null) ?? null;
};
</script>

<template>
  <div v-if="background" :class="rootClass" :style="rootStyle" v-bind="rest">
    <video
      :ref="setMedia"
      class="video-embed__media"
      :src="src"
      :poster="poster"
      muted
      loop
      playsinline
      preload="metadata"
      aria-hidden="true"
      tabindex="-1"
    />
  </div>
  <div v-else :class="rootClass" :style="rootStyle" v-bind="rest">
    <template v-if="playing && !lightbox">
      <video
        v-if="kind === 'video'"
        :ref="setMedia"
        class="video-embed__media"
        :src="src"
        :poster="poster"
        controls
        autoplay
        playsinline
        :aria-label="title"
      >
        <track v-if="captions" kind="captions" :src="captions" :srclang="captionsLang" default />
      </video>
      <iframe
        v-else
        :ref="setMedia"
        class="video-embed__media"
        :src="src"
        :title="title"
        :allow="VIDEO_EMBED_ALLOW"
        allowfullscreen
      />
    </template>
    <button
      v-else
      type="button"
      class="video-embed__poster"
      :aria-label="playLabel ?? `Play ${title}`"
      :aria-haspopup="lightbox ? 'dialog' : undefined"
      @click="play"
    >
      <img v-if="poster" class="video-embed__image" :src="poster" alt="" />
      <span class="video-embed__play" aria-hidden="true" />
    </button>
    <Dialog v-if="lightbox" v-model:open="open">
      <DialogContent size="fullscreen">
        <DialogTitle class="video-embed__sr">{{ title }}</DialogTitle>
        <div v-if="open" class="video-embed__frame">
          <video
            v-if="kind === 'video'"
            :ref="setMedia"
            class="video-embed__media"
            :src="src"
            :poster="poster"
            controls
            autoplay
            playsinline
            :aria-label="title"
          >
            <track v-if="captions" kind="captions" :src="captions" :srclang="captionsLang" default />
          </video>
          <iframe
            v-else
            :ref="setMedia"
            class="video-embed__media"
            :src="src"
            :title="title"
            :allow="VIDEO_EMBED_ALLOW"
            allowfullscreen
          />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
