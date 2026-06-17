/**
 * Fixed component-level token definitions.
 *
 * Component tokens alias semantic tokens and spacing/radius primitives.
 * They map to the Component collection from the token library which has
 * Desktop and Mobile modes. Desktop values are the default; the pipeline
 * generates CSS overrides for mobile via a media query or data attribute.
 *
 * Spacing references: {spacing.space-04} = 16px at 4px base
 * Radius references:  {border-radius.04} = 8px
 */

export const componentTokensDesktop = {
  // ── Shared radius ─────────────────────────────────────────────────────────
  "radius-interactive": { $value: "{border-radius.04}", $type: "dimension" },
  "radius-checkbox":    { $value: "{border-radius.02}", $type: "dimension" },
  "radius-status":      { $value: "{border-radius.full}", $type: "dimension" },

  // ── Button spacing ────────────────────────────────────────────────────────
  "Button": {
    Small: {
      horizontal: { $value: "{spacing.space-02}",  $type: "dimension" },
      vertical:   { $value: "{spacing.space-005}", $type: "dimension" },
    },
    Medium: {
      horizontal: { $value: "{spacing.space-03}", $type: "dimension" },
      vertical:   { $value: "{spacing.space-01}", $type: "dimension" },
    },
    Large: {
      horizontal: { $value: "{spacing.space-04}", $type: "dimension" },
      vertical:   { $value: "{spacing.space-02}", $type: "dimension" },
      square:     { $value: "{spacing.space-025}", $type: "dimension" },
    },
  },
} as const;

export const componentTokensMobile = {
  // ── Shared radius (same as desktop) ──────────────────────────────────────
  "radius-interactive": { $value: "{border-radius.04}", $type: "dimension" },
  "radius-checkbox":    { $value: "{border-radius.02}", $type: "dimension" },
  "radius-status":      { $value: "{border-radius.full}", $type: "dimension" },

  // ── Button spacing (mobile uses larger padding) ───────────────────────────
  "Button": {
    Small: {
      horizontal: { $value: "{spacing.space-03}", $type: "dimension" },
      vertical:   { $value: "{spacing.space-02}", $type: "dimension" },
    },
    Medium: {
      horizontal: { $value: "{spacing.space-04}", $type: "dimension" },
      vertical:   { $value: "{spacing.space-02}", $type: "dimension" },
    },
    Large: {
      horizontal: { $value: "{spacing.space-05}", $type: "dimension" },
      vertical:   { $value: "{spacing.space-04}", $type: "dimension" },
      square:     { $value: "{spacing.space-05}", $type: "dimension" },
    },
  },
} as const;

/** Default export — desktop values are the canonical baseline */
export const componentTokens = componentTokensDesktop;
