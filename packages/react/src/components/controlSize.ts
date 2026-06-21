/**
 * Shared size config for dynamic-sizing controls (buttons, toggles, inputs,
 * selects, date fields, etc.) — the single source of truth for how content
 * scales with a control's size variant.
 *
 *   size   icon   font
 *   sm     16px   body-medium
 *   md     20px   body-large
 *   lg     24px   body-large
 *
 * Control HEIGHT is separate (`--control-height-{sm,md,lg}`, derived from the
 * body-large line height + padding); this only governs the icon edge length and
 * the text style applied to each size.
 */
export type ControlSize = "sm" | "md" | "lg";

/** Icon edge length (px) per control size. */
export const CONTROL_ICON_SIZE: Record<ControlSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

/** Typography utility class per control size (small steps down to body-medium). */
export const CONTROL_TEXT_CLASS: Record<ControlSize, string> = {
  sm: "text-default-body-medium",
  md: "text-default-body-large",
  lg: "text-default-body-large",
};
