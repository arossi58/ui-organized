import { useMemo } from "react";
import { useBuilderStore } from "../state/themeState";
import { computeAllPreviewVars } from "../utils/semanticMapping";

// React's CSSProperties doesn't include CSS custom properties in its type, but
// React does apply them correctly at runtime. We use this intersection to avoid
// the `as CSSProperties` cast which could swallow the custom property keys.
type PreviewStyle = React.CSSProperties & Record<`--${string}`, string>;

/**
 * Computes all CSS custom properties for the preview container based on
 * the current builder state. Memoized so it only recomputes on actual changes.
 */
export function usePreviewProperties(): PreviewStyle {
  const {
    brandHex,
    brandRamp,
    neutralRamp,
    brandShade,
    headingFamily,
    bodyFamily,
    headingWeights,
    bodyWeights,
    typeScaleSteps,
    lineHeightScale,
    spacingScale,
    borderRadius,
  } = useBuilderStore();

  return useMemo(
    () =>
      computeAllPreviewVars({
        brandHex,
        brandRamp,
        neutralRamp,
        brandShade,
        headingFamily,
        bodyFamily,
        headingWeights,
        bodyWeights,
        typeScaleSteps,
        lineHeightScale,
        spacingScale,
        borderRadius,
      }) as PreviewStyle,
    [
      brandHex,
      brandRamp,
      neutralRamp,
      brandShade,
      headingFamily,
      bodyFamily,
      headingWeights,
      bodyWeights,
      typeScaleSteps,
      lineHeightScale,
      spacingScale,
      borderRadius,
    ],
  );
}
