export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageCropperProps {
  /** Image to crop. A data URI or a URL. */
  src: string;
  /** Alternative text for the image. */
  alt?: string;
  /** Accessible label rendered above the viewport. */
  label?: string;
  /** Helper text rendered below the viewport. */
  helperText?: string;
  /** Crop box the editor opens with. Defaults to the largest centred box. */
  initialCrop?: CropRect;
  /** Locks the crop box to a ratio, e.g. `1` for square or `16 / 9`. */
  aspectRatio?: number;
  /** Shape of the crop box. `circle` still reports a square rect. Defaults to 'rectangle'. */
  cropShape?: "rectangle" | "circle";
  /** Controlled zoom level. Use `v-model:zoom` for two-way binding. */
  zoom?: number;
  /** Initial zoom for the uncontrolled case. Defaults to 1. */
  defaultZoom?: number;
  /** Smallest zoom level. Defaults to 1. */
  minZoom?: number;
  /** Largest zoom level. Defaults to 3. */
  maxZoom?: number;
  /** Draws rule-of-thirds guides inside the crop box. Defaults to true. */
  showGrid?: boolean;
  /** Prevents the crop box being moved or resized. Defaults to false. */
  fixedCropArea?: boolean;
  /** Size variant, driving the viewport's height. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
}
