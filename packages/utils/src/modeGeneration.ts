/**
 * Semantic mode generation.
 *
 * Given the resolved primitive ramps (brand, neutral, functional),
 * generates semantic-to-primitive mappings for light and dark modes.
 *
 * These mappings become the `modes` object in the theme config.
 * Keys are semantic token names; values are primitive references
 * in the format "{palette}.{step}" (e.g. "neutral.50", "brand.500").
 *
 * Design rules encoded here:
 *   - Light mode: surfaces are light (neutral.50/100), text is dark (neutral.900)
 *   - Dark mode:  surfaces are dark (neutral.950/900), text is light (neutral.50)
 *   - Interactive (CTA) colors use mid-range brand steps, adjusted per mode
 *   - Borders use neutral steps that provide 3:1+ contrast against their surface
 *   - Functional colors (error, success, warning, info) use fixed mid-range steps
 */

export interface ResolvedPrimitives {
  brand: Record<string, unknown>;
  neutral: Record<string, unknown>;
  functional: {
    success: Record<string, unknown>;
    warning: Record<string, unknown>;
    error: Record<string, unknown>;
    info: Record<string, unknown>;
  };
}

export type SemanticMode = Record<string, string>;

export interface GeneratedModes {
  light: SemanticMode;
  dark: SemanticMode;
}

/**
 * Generate light and dark semantic color mappings from resolved primitives.
 *
 * The primitives object is inspected to determine which steps are available
 * in the brand ramp, then appropriate steps are chosen for each role.
 */
export function generateModes(primitives: ResolvedPrimitives): GeneratedModes {
  const brandSteps = Object.keys(primitives.brand).map(Number).sort((a, b) => a - b);
  const neutralSteps = Object.keys(primitives.neutral).map(Number).sort((a, b) => a - b);

  // Find the closest step to a target value within an available set
  function closest(steps: number[], target: number): string {
    const found = steps.reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev,
    );
    return String(found);
  }

  // Brand interactive steps — choose from available brand ramp
  const brandInteractiveLight = closest(brandSteps, 500);
  const brandInteractiveLightHover = closest(brandSteps, 600);
  const brandInteractiveDark = closest(brandSteps, 400);
  const brandInteractiveDarkHover = closest(brandSteps, 300);
  const brandSubtle = closest(brandSteps, 50);
  const brandSubtleDark = closest(brandSteps, 900);
  const brandFg = closest(brandSteps, 600);
  const brandFgDark = closest(brandSteps, 300);

  // Neutral surface steps
  const surfaceLight = closest(neutralSteps, 50);
  const surfaceLight2 = closest(neutralSteps, 100);
  const surfaceLight3 = closest(neutralSteps, 200);
  const surfaceDark = closest(neutralSteps, 950);
  const surfaceDark2 = closest(neutralSteps, 900);
  const surfaceDark3 = closest(neutralSteps, 800);

  // Neutral text steps
  const fgPrimaryLight = closest(neutralSteps, 900);
  const fgSecondaryLight = closest(neutralSteps, 600);
  const fgDisabledLight = closest(neutralSteps, 400);
  const fgPrimaryDark = closest(neutralSteps, 50);
  const fgSecondaryDark = closest(neutralSteps, 400);
  const fgDisabledDark = closest(neutralSteps, 600);

  // Neutral border steps
  const borderDefaultLight = closest(neutralSteps, 200);
  const borderStrongLight = closest(neutralSteps, 300);
  const borderDefaultDark = closest(neutralSteps, 700);
  const borderStrongDark = closest(neutralSteps, 600);

  const light: SemanticMode = {
    // Surfaces
    "bg.primary": `neutral.${surfaceLight}`,
    "bg.secondary": `neutral.${surfaceLight2}`,
    "bg.tertiary": `neutral.${surfaceLight3}`,

    // Brand-tinted surface
    "bg.brand-subtle": `brand.${brandSubtle}`,

    // Overlays / elevated surfaces
    "bg.overlay": `neutral.${surfaceLight}`,

    // Foreground / text
    "fg.primary": `neutral.${fgPrimaryLight}`,
    "fg.secondary": `neutral.${fgSecondaryLight}`,
    "fg.disabled": `neutral.${fgDisabledLight}`,
    "fg.on-brand": `neutral.${surfaceLight}`,
    "fg.brand": `brand.${brandFg}`,

    // Borders
    "border.default": `neutral.${borderDefaultLight}`,
    "border.strong": `neutral.${borderStrongLight}`,
    "border.focus": `brand.${brandInteractiveLight}`,

    // Interactive / brand
    "interactive.default": `brand.${brandInteractiveLight}`,
    "interactive.hover": `brand.${brandInteractiveLightHover}`,
    "interactive.active": `brand.${closest(brandSteps, 700)}`,
    "interactive.disabled": `neutral.${fgDisabledLight}`,

    // Functional
    "functional.success": `functional.success.500`,
    "functional.warning": `functional.warning.500`,
    "functional.error": `functional.error.500`,
    "functional.info": `functional.info.500`,

    // Functional surfaces
    "functional.success-bg": `functional.success.50`,
    "functional.warning-bg": `functional.warning.50`,
    "functional.error-bg": `functional.error.50`,
    "functional.info-bg": `functional.info.50`,
  };

  const dark: SemanticMode = {
    // Surfaces
    "bg.primary": `neutral.${surfaceDark}`,
    "bg.secondary": `neutral.${surfaceDark2}`,
    "bg.tertiary": `neutral.${surfaceDark3}`,

    // Brand-tinted surface
    "bg.brand-subtle": `brand.${brandSubtleDark}`,

    // Overlays
    "bg.overlay": `neutral.${surfaceDark}`,

    // Foreground / text
    "fg.primary": `neutral.${fgPrimaryDark}`,
    "fg.secondary": `neutral.${fgSecondaryDark}`,
    "fg.disabled": `neutral.${fgDisabledDark}`,
    "fg.on-brand": `neutral.${surfaceLight}`,
    "fg.brand": `brand.${brandFgDark}`,

    // Borders
    "border.default": `neutral.${borderDefaultDark}`,
    "border.strong": `neutral.${borderStrongDark}`,
    "border.focus": `brand.${brandInteractiveDark}`,

    // Interactive / brand
    "interactive.default": `brand.${brandInteractiveDark}`,
    "interactive.hover": `brand.${brandInteractiveDarkHover}`,
    "interactive.active": `brand.${closest(brandSteps, 200)}`,
    "interactive.disabled": `neutral.${fgDisabledDark}`,

    // Functional
    "functional.success": `functional.success.500`,
    "functional.warning": `functional.warning.500`,
    "functional.error": `functional.error.500`,
    "functional.info": `functional.info.500`,

    // Functional surfaces (inverted — dark tints)
    "functional.success-bg": `functional.success.950`,
    "functional.warning-bg": `functional.warning.950`,
    "functional.error-bg": `functional.error.950`,
    "functional.info-bg": `functional.info.950`,
  };

  return { light, dark };
}
