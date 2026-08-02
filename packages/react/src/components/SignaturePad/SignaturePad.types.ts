export interface SignaturePadProps {
  /** Accessible label rendered above the pad. */
  label?: string;
  /** Helper text rendered below the pad. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /** Controlled strokes, as SVG path data. */
  paths?: string[];
  /** Initial strokes for the uncontrolled case. */
  defaultPaths?: string[];
  /** Called as each stroke is drawn. */
  onDraw?: (paths: string[]) => void;
  /**
   * Called when a stroke finishes. `getDataUrl` rasterises the signature — use
   * it when a server wants a PNG rather than the stroke paths the hidden input
   * submits.
   */
  onDrawEnd?: (
    paths: string[],
    getDataUrl: (type: "image/png" | "image/jpeg" | "image/svg+xml", quality?: number) => Promise<string>,
  ) => void;
  /**
   * Ink width in device pixels. This is a canvas stroke, not CSS — the ink's
   * *colour* is themed, its thickness is geometry. Defaults to 2.
   */
  strokeWidth?: number;
  /** Shows the sign-here rule across the pad. Defaults to true. */
  showGuide?: boolean;
  /** Shows the clear button. Defaults to true. */
  showClear?: boolean;
  /** Text on the clear button. Defaults to 'Clear'. */
  clearLabel?: string;
  /** Size variant, driving the pad's height. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Surface treatment. `bordered` draws a full box. Defaults to 'default'. */
  variant?: "default" | "bordered";
  /** Marks the field required and shows the required indicator. */
  required?: boolean;
  /** Disables drawing. */
  disabled?: boolean;
  /** Makes the signature read-only while keeping it visible. */
  readOnly?: boolean;
  /** Form field name for the hidden input. */
  name?: string;
  className?: string;
}
