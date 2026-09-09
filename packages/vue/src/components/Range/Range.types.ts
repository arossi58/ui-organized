export interface RangeProps {
  /** Accessible label rendered above the track, beside the value readout. */
  label?: string;
  /**
   * Controlled value. Use `v-model` for two-way binding.
   *
   * Spelled `modelValue` rather than React's `value`, which is what every
   * controlled value in this package is called — see NumberField for the
   * longer note.
   */
  modelValue?: number;
  /** Initial value for uncontrolled usage. Defaults to `min` (or the first snap value). */
  defaultValue?: number;
  /** Minimum value. Defaults to 0. Ignored when `snapValues` is set. */
  min?: number;
  /** Maximum value. Defaults to 100. Ignored when `snapValues` is set. */
  max?: number;
  /**
   * The interval the slider snaps to between `min` and `max`. Defaults to 1.
   * Use this for "snap at certain intervals" (e.g. `:step="5"` → 0, 5, 10 …).
   * Ignored when `snapValues` is set.
   */
  step?: number;
  /**
   * A fixed set of allowed values the thumb snaps to ("snap to certain values").
   * When provided, the slider only settles on these values — evenly spaced along
   * the track — and both pointer and keyboard interaction land exactly on one of
   * them. Takes precedence over `min`/`max`/`step`.
   */
  snapValues?: number[];
  /** Show the start/end value labels at each end of the track. */
  rangeLabels?: boolean;
  /** Custom content for the start (min) label. Defaults to the resolved minimum. */
  startLabel?: string | number;
  /** Custom content for the end (max) label. Defaults to the resolved maximum. */
  endLabel?: string | number;
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /**
   * Error state. Pass a string to render an error message below the slider,
   * or `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /** Whether the slider should ignore user interaction. */
  disabled?: boolean;
  /** Hide the numeric value readout in the header. */
  hideValue?: boolean;
  /** Format the value shown in the header readout. */
  formatValue?: (value: number) => string;
  /** Name attribute for form submission. */
  name?: string;
  /** ID for the slider root. */
  id?: string;
  /**
   * Accessible name for the thumb when there is no visible `label`.
   *
   * Spelled `ariaLabel`, not `"aria-label"`, because Vue camelises prop names
   * declared through a type — a prop literally named `aria-label` is compiled to
   * `ariaLabel` and the quoted key is never populated. Templates still write
   * `aria-label="..."`; Vue maps it here.
   */
  ariaLabel?: string;
}
