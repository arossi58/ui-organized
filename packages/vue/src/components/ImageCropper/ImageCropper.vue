<script setup lang="ts">
import { computed, useAttrs } from "vue";
import {
  ImageCropper as ArkImageCropper,
  useImageCropper,
  type ImageCropperCropChangeDetails,
  type ImageCropperZoomChangeDetails,
} from "@ark-ui/vue";
import { clsx } from "clsx";
import { imageCropperStyles } from "@ui-organized/core";
import { definedOnly } from "../../props.js";
import type { ImageCropperProps } from "./ImageCropper.types.js";
import "@ui-organized/core/components/ImageCropper/ImageCropper.css";

/** Every corner and edge, in the order zag names them. */
const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;

defineOptions({ inheritAttrs: false });
// `showGrid` defaults to *true* and `fixedCropArea` is forwarded to the machine,
// so both have to say so here: Vue casts an absent Boolean prop to `false`, and
// neither default survives that on its own. See ../../props.ts.
const props = withDefaults(defineProps<ImageCropperProps>(), {
  alt: "",
  cropShape: "rectangle",
  showGrid: true,
  size: "md",
  fixedCropArea: undefined,
});
const emit = defineEmits<{
  cropChange: [crop: { x: number; y: number; width: number; height: number }];
  "update:zoom": [zoom: number];
  zoomChange: [zoom: number];
}>();

const attrs = useAttrs();

const rootClass = computed(() =>
  clsx(
    imageCropperStyles({ size: props.size, cropShape: props.cropShape }),
    attrs.class as string,
  ),
);

/**
 * The machine is built here and handed to `RootProvider`, rather than letting
 * `ImageCropper.Root` build it.
 *
 * Ark Vue 5.39's `image-cropper-root` calls `useImageCropper({}, emit)` — an
 * empty object where its own props should go — so every prop it declares
 * (`cropShape`, `aspectRatio`, `fixedCropArea`, the zoom bounds) is accepted,
 * removed from `$attrs` because it is declared, and then dropped. Nothing warns.
 * The symptom is a circular crop that renders `data-shape="rectangle"` and a
 * `fixedCropArea` that stays draggable — a wrapper bug, not a machine one: Ark
 * React and Ark Svelte both forward their props, and the parity gate reddens on
 * `data-shape` and `data-disabled` when this is removed.
 *
 * `RootProvider` renders exactly what `Root` does — the same `getRootProps()` on
 * the same `ark.div` — so this costs no DOM difference. Delete it, and go back
 * to `ImageCropper.Root`, once the wrapper is fixed upstream.
 */
const machineProps = computed(() => ({
  ...definedOnly({
    initialCrop: props.initialCrop,
    aspectRatio: props.aspectRatio,
    cropShape: props.cropShape,
    zoom: props.zoom,
    defaultZoom: props.defaultZoom,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom,
    fixedCropArea: props.fixedCropArea,
  }),
  onCropChange(details: ImageCropperCropChangeDetails) {
    emit("cropChange", details.crop);
  },
  onZoomChange(details: ImageCropperZoomChangeDetails) {
    emit("update:zoom", details.zoom);
    emit("zoomChange", details.zoom);
  },
}));

const cropper = useImageCropper(machineProps);
</script>

<template>
  <ArkImageCropper.RootProvider :value="cropper" :class="rootClass">
    <span v-if="label" class="field__label">{{ label }}</span>

    <ArkImageCropper.Viewport class="image-cropper__viewport">
      <ArkImageCropper.Image :src="src" :alt="alt" class="image-cropper__image" />
      <ArkImageCropper.Selection class="image-cropper__selection">
        <template v-if="showGrid">
          <ArkImageCropper.Grid axis="horizontal" class="image-cropper__grid" />
          <ArkImageCropper.Grid axis="vertical" class="image-cropper__grid" />
        </template>
        <!--
          Handles are rendered even when `fixedCropArea` is set — zag disables
          them rather than removing them, so the box keeps its shape.
        -->
        <ArkImageCropper.Handle
          v-for="position in HANDLES"
          :key="position"
          :position="position"
          :class="`image-cropper__handle image-cropper__handle--${position}`"
        />
      </ArkImageCropper.Selection>
    </ArkImageCropper.Viewport>

    <span v-if="helperText" class="field__description">{{ helperText }}</span>
  </ArkImageCropper.RootProvider>
</template>
