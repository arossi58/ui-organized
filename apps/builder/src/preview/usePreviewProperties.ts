import { useMemo } from "react";
import { useBuilderStore } from "../state/themeState";
import { computeAllPreviewVars } from "../utils/semanticMapping";
import type { CSSProperties } from "react";

/**
 * Computes all CSS custom properties for the preview container based on
 * the current builder state. Memoized so it only recomputes on actual changes.
 */
export function usePreviewProperties(): CSSProperties {
  const {
    brandRamp,
    neutralRamp,
    headingFamily,
    bodyFamily,
    headingWeights,
    bodyWeights,
    typeScaleSteps,
    spacingScale,
    borderRadius,
  } = useBuilderStore();

  return useMemo(
    () =>
      computeAllPreviewVars({
        brandRamp,
        neutralRamp,
        headingFamily,
        bodyFamily,
        headingWeights,
        bodyWeights,
        typeScaleSteps,
        spacingScale,
        borderRadius,
      }) as CSSProperties,
    [
      brandRamp,
      neutralRamp,
      headingFamily,
      bodyFamily,
      headingWeights,
      bodyWeights,
      typeScaleSteps,
      spacingScale,
      borderRadius,
    ],
  );
}
