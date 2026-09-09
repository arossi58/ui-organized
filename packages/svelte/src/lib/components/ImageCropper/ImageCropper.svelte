<script lang="ts">
  import { ImageCropper as ArkImageCropper } from "@ark-ui/svelte";
  import { clsx } from "clsx";
  import { imageCropperStyles } from "@ui-organized/core";
  import type { ImageCropperProps } from "./ImageCropper.types.js";
  import "@ui-organized/core/components/ImageCropper/ImageCropper.css";

  /** Every corner and edge, in the order zag names them. */
  const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;

  let {
    src,
    alt = "",
    label,
    helperText,
    initialCrop,
    aspectRatio,
    cropShape = "rectangle",
    onCropChange,
    zoom = $bindable(),
    defaultZoom,
    onZoomChange,
    minZoom,
    maxZoom,
    showGrid = true,
    fixedCropArea,
    size = "md",
    class: className,
  }: ImageCropperProps = $props();
</script>

<ArkImageCropper.Root
  class={clsx(imageCropperStyles({ size, cropShape }), className)}
  {initialCrop}
  {aspectRatio}
  {cropShape}
  onCropChange={onCropChange && ((details) => onCropChange(details.crop))}
  {zoom}
  {defaultZoom}
  onZoomChange={(details) => {
    zoom = details.zoom;
    onZoomChange?.(details.zoom);
  }}
  {minZoom}
  {maxZoom}
  {fixedCropArea}
>
  {#if label}<span class="field__label">{label}</span>{/if}

  <ArkImageCropper.Viewport class="image-cropper__viewport">
    <ArkImageCropper.Image {src} {alt} class="image-cropper__image" />
    <ArkImageCropper.Selection class="image-cropper__selection">
      {#if showGrid}
        <ArkImageCropper.Grid axis="horizontal" class="image-cropper__grid" />
        <ArkImageCropper.Grid axis="vertical" class="image-cropper__grid" />
      {/if}
      <!--
        Handles are rendered even when `fixedCropArea` is set — zag disables them
        rather than removing them, so the box keeps its shape.
      -->
      {#each HANDLES as position (position)}
        <ArkImageCropper.Handle
          {position}
          class={`image-cropper__handle image-cropper__handle--${position}`}
        />
      {/each}
    </ArkImageCropper.Selection>
  </ArkImageCropper.Viewport>

  {#if helperText}<span class="field__description">{helperText}</span>{/if}
</ArkImageCropper.Root>
