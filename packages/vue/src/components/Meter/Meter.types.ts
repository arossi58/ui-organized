import type { Component } from "vue";
import type { ControlSize } from "@ui-organized/core";

export interface MeterProps {
  /** The current value. Required — a meter always shows a concrete measurement. */
  value: number;
  /** Minimum value. Defaults to 0. */
  min?: number;
  /** Maximum value. Defaults to 100. */
  max?: number;
  /**
   * Optional label rendered above the track.
   *
   * A string, or a component for anything richer — the same union `Progress`
   * takes, and for the same reason: React's ReactNode has no Vue equivalent.
   */
  label?: string | Component;
  /** Whether to show the formatted value beside the label. Defaults to false. */
  showValue?: boolean;
  /** Options to format the displayed value (e.g. `{ style: "percent" }`). */
  format?: Intl.NumberFormatOptions;
  /** Color variant. Defaults to 'default'. */
  variant?: "default" | "success" | "warning" | "error";
  /** Track thickness. Defaults to 'md'. */
  size?: ControlSize;
  /**
   * Accessible name when the meter is rendered without a visible `label`.
   *
   * `ariaLabel`, not `"aria-label"`. Vue camelises a type-declared prop name
   * before matching, so a prop written as `"aria-label"` compiles to `ariaLabel`
   * and the quoted key is never populated — the declaration would look right and
   * hand the component `undefined` forever. Writing it camelCase is not a
   * different API: a template that says `aria-label="Disk usage"` still lands
   * here, because incoming keys are camelised the same way.
   */
  ariaLabel?: string;
}
