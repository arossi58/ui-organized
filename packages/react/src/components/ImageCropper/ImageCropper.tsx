import { ImageCropper as ArkImageCropper } from "@ark-ui/react";
import { clsx } from "clsx";
import { imageCropperStyles } from "./ImageCropper.styles.js";
import type { ImageCropperProps } from "./ImageCropper.types.js";
import "@ui-organized/core/components/ImageCropper/ImageCropper.css";

/** Every corner and edge, in the order zag names them. */
const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;

export function ImageCropper({
  src,
  alt = "",
  label,
  helperText,
  initialCrop,
  aspectRatio,
  cropShape = "rectangle",
  onCropChange,
  zoom,
  defaultZoom,
  onZoomChange,
  minZoom,
  maxZoom,
  showGrid = true,
  fixedCropArea,
  size = "md",
  className,
}: ImageCropperProps) {
  return (
    <ArkImageCropper.Root
      className={clsx(imageCropperStyles({ size, cropShape }), className)}
      initialCrop={initialCrop}
      aspectRatio={aspectRatio}
      cropShape={cropShape}
      onCropChange={onCropChange && ((details) => onCropChange(details.crop))}
      zoom={zoom}
      defaultZoom={defaultZoom}
      onZoomChange={onZoomChange && ((details) => onZoomChange(details.zoom))}
      minZoom={minZoom}
      maxZoom={maxZoom}
      fixedCropArea={fixedCropArea}
    >
      {label && <span className="field__label">{label}</span>}

      <ArkImageCropper.Viewport className="image-cropper__viewport">
        <ArkImageCropper.Image src={src} alt={alt} className="image-cropper__image" />
        <ArkImageCropper.Selection className="image-cropper__selection">
          {showGrid && (
            <>
              <ArkImageCropper.Grid axis="horizontal" className="image-cropper__grid" />
              <ArkImageCropper.Grid axis="vertical" className="image-cropper__grid" />
            </>
          )}
          {/* Handles are rendered even when `fixedCropArea` is set — zag disables
              them rather than removing them, so the box keeps its shape. */}
          {HANDLES.map((position) => (
            <ArkImageCropper.Handle
              key={position}
              position={position}
              className={`image-cropper__handle image-cropper__handle--${position}`}
            />
          ))}
        </ArkImageCropper.Selection>
      </ArkImageCropper.Viewport>

      {helperText && <span className="field__description">{helperText}</span>}
    </ArkImageCropper.Root>
  );
}
