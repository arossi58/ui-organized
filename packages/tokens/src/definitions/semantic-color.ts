/**
 * Fixed semantic color token definitions.
 *
 * These match the actual token library architecture exactly:
 *   - color-border:      subtle, medium, emphasis, strong, data-entry
 *   - color-interactive: primary, secondary, tertiary, ghost, destructive,
 *                        contents, ui, focus, focus-inverse, inactive
 *   - color-status:      success/info/caution/warning/error with bg+content variants
 *   - color-surface:     base, subtle, medium, emphasis, strong, overlays
 *   - color-content:     foreground text + icons — primary, secondary, interactive,
 *                        tertiary, placeholder, inverse
 *
 * Default values reference the neutral palette (dark-first surface layer).
 * Mode overrides swap these references per theme mode.
 *
 * All references use the format {palette.step} where palette is a primitive
 * ramp name and step is a 100-1600 value.
 */

export const semanticColorTokens = {
  // ── Borders ──────────────────────────────────────────────────────────────
  "color-border": {
    subtle:       { $value: "{neutral.1500}", $type: "color" },
    medium:       { $value: "{neutral.1400}", $type: "color" },
    emphasis:     { $value: "{neutral.1300}", $type: "color" },
    strong:       { $value: "{neutral.1200}", $type: "color" },
    "data-entry": { $value: "{neutral.1300}", $type: "color" },
  },

  // ── Interactive ───────────────────────────────────────────────────────────
  "color-interactive": {
    primary: {
      default:  { $value: "{brand.1200}", $type: "color" },
      hover:    { $value: "{brand.1400}", $type: "color" },
      active:   { $value: "{brand.1600}", $type: "color" },
      selected: { $value: "{brand.1200}", $type: "color" },
    },
    secondary: {
      default:  { $value: "{neutral.1400}", $type: "color" },
      hover:    { $value: "{neutral.1300}", $type: "color" },
      active:   { $value: "{neutral.700}",  $type: "color" },
      selected: { $value: "{neutral.900}",  $type: "color" },
    },
    tertiary: {
      default:  { $value: "{brand.900}",  $type: "color" },
      hover:    { $value: "{brand.700}",  $type: "color" },
      active:   { $value: "{brand.600}",  $type: "color" },
      selected: { $value: "{brand.1000}", $type: "color" },
    },
    ghost: {
      default: { $value: "rgba(252, 252, 252, 0)", $type: "color" },
      hover:   { $value: "{black.800}",            $type: "color" },
      active:  { $value: "{black.1000}",           $type: "color" },
    },
    destructive: {
      default:       { $value: "{crimson.1000}", $type: "color" },
      "default-ghost":{ $value: "{crimson.800}", $type: "color" },
      hover:         { $value: "{crimson.1200}", $type: "color" },
      "hover-ghost": { $value: "{crimson.600}",  $type: "color" },
      active:        { $value: "{crimson.1300}", $type: "color" },
      "active-ghost":{ $value: "{crimson.400}",  $type: "color" },
    },
    contents:       { $value: "{white.100}",   $type: "color" },
    ui: {
      default:  { $value: "{neutral.1600}", $type: "color" },
      hover:    { $value: "{neutral.1500}", $type: "color" },
      active:   { $value: "{neutral.1400}", $type: "color" },
      selected: { $value: "{neutral.1400}", $type: "color" },
      inverse:  { $value: "{neutral.100}",  $type: "color" },
      light:    { $value: "{neutral.100}",  $type: "color" },
      dark:     { $value: "{neutral.1600}", $type: "color" },
    },
    focus:         { $value: "{white.100}",   $type: "color" },
    "focus-inverse":{ $value: "{black.1600}", $type: "color" },
    inactive: {
      "01": { $value: "{black.600}", $type: "color" },
      "02": { $value: "{black.400}", $type: "color" },
      "03": { $value: "{black.200}", $type: "color" },
    },
  },

  // ── Status ────────────────────────────────────────────────────────────────
  "color-status": {
    // Success
    success:           { $value: "{lima.700}",        $type: "color" },
    "success-bg":      { $value: "{lima.1100}",       $type: "color" },
    "success-content": { $value: "{lima.300}",        $type: "color" },
    // Info (primary blue)
    info:              { $value: "{cerulean.800}",    $type: "color" },
    "info-bg":         { $value: "{cerulean.1100}",   $type: "color" },
    "info-content":    { $value: "{cerulean.300}",    $type: "color" },
    // Info secondary (teal)
    "info-secondary":          { $value: "{caribbean.700}",  $type: "color" },
    "info-secondary-bg":       { $value: "{caribbean.1100}", $type: "color" },
    "info-secondary-content":  { $value: "{caribbean.300}",  $type: "color" },
    // Caution (yellow — uses dark text when emphasized)
    caution:           { $value: "{candlelight.600}",  $type: "color" },
    "caution-bg":      { $value: "{candlelight.1100}", $type: "color" },
    "caution-content": { $value: "{candlelight.300}",  $type: "color" },
    // Warning (pink)
    warning:           { $value: "{cerise.800}",      $type: "color" },
    "warning-bg":      { $value: "{cerise.1100}",     $type: "color" },
    "warning-content": { $value: "{cerise.300}",      $type: "color" },
    // Error
    error:             { $value: "{crimson.800}",     $type: "color" },
    "error-message":   { $value: "{crimson.600}",     $type: "color" },
    "error-bg":        { $value: "{crimson.1100}",    $type: "color" },
    "error-content":   { $value: "{crimson.300}",     $type: "color" },
  },

  // ── Surfaces ──────────────────────────────────────────────────────────────
  "color-surface": {
    base:             { $value: "{black.1600}",           $type: "color" },
    subtle:           { $value: "{black.1300}",           $type: "color" },
    medium:           { $value: "{neutral.1600}",         $type: "color" },
    emphasis:         { $value: "{neutral.1500}",         $type: "color" },
    strong:           { $value: "{neutral.1400}",         $type: "color" },
    "overlay-medium": { $value: "{curtain.black-1200-80p}", $type: "color" },
    "overlay-strong": { $value: "{curtain.black-80p}",    $type: "color" },
  },

  // ── Content (text + icons) ─────────────────────────────────────────────────
  "color-content": {
    "primary":     { $value: "{white.100}",  $type: "color" },
    "secondary":   { $value: "{white.800}",  $type: "color" },
    "interactive": { $value: "{white.100}",  $type: "color" },
    "tertiary":    { $value: "{white.1100}", $type: "color" },
    "placeholder": { $value: "{white.1100}", $type: "color" },
    "inverse":     { $value: "{black.1600}", $type: "color" },
  },

  // ── Elevation ─────────────────────────────────────────────────────────────
  // Mode-dependent OKLCH composite values for surface layering.
  // Default (dark mode): neutral step 400 at 8%/16% — brightens layers above base.
  // Light mode override (generated by modeGeneration): step 1400 — darkens layers.
  "color-elevation": {
    subtle: { $value: "oklch(from var(--neutral-400) l c h / 0.08)", $type: "color" },
    medium: { $value: "oklch(from var(--neutral-400) l c h / 0.16)", $type: "color" },
  },
} as const;
