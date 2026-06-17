import { hexToRgb, rgbToOklch, oklchToRgbGamutMapped, rgbToHex, rgbToHsl, hslToRgb } from './colorConversions';
import { getLuminance } from './contrast';
import { applyEasing } from './easing';

// Find OKLCH lightness that produces target luminance for a given hue/chroma
export const findLightnessForLuminance = (targetY, chroma, hue, maxIterations = 15) => {
  let minL = 0;
  let maxL = 1;
  let bestL = 0.5;
  const epsilon = 0.001;

  for (let i = 0; i < maxIterations; i++) {
    const testL = (minL + maxL) / 2;
    const rgb = oklchToRgbGamutMapped(testL, chroma, hue);
    const y = getLuminance(rgb.r, rgb.g, rgb.b);

    if (Math.abs(y - targetY) < epsilon) {
      return testL;
    }

    if (y < targetY) {
      minL = testL;
    } else {
      maxL = testL;
    }
    bestL = testL;
  }

  return bestL;
};

// Helper function to get hue-dependent lightness adjustment
// Blues/purples have smaller gamut, yellows/greens have larger gamut
export const getHueLightnessAdjustment = (hue) => {
  // Normalize hue to 0-360
  const h = ((hue % 360) + 360) % 360;

  // Blues/purples (200-280°): compress range (return values < 1.0)
  // Yellows/greens (60-140°): expand range (return values > 1.0)
  // Other hues: interpolate between

  if (h >= 200 && h <= 280) {
    // Blue to purple - most restricted gamut
    // At hue 240 (pure blue), use 0.7 compression
    const blueCenter = 240;
    const distanceFromBlue = Math.abs(h - blueCenter) / 40; // 0 at center, 1 at edges
    return 0.7 + distanceFromBlue * 0.15; // 0.7 to 0.85
  } else if (h >= 60 && h <= 140) {
    // Yellow to green - least restricted gamut
    // At hue 90 (yellow-green), use 1.15 expansion
    const yellowCenter = 90;
    const distanceFromYellow = Math.abs(h - yellowCenter) / 40;
    return 1.15 - distanceFromYellow * 0.1; // 1.05 to 1.15
  } else if (h >= 280 || h <= 20) {
    // Red to purple-red - moderate restriction
    return 0.9;
  } else if (h >= 140 && h <= 200) {
    // Cyan - moderate gamut
    return 1.0;
  } else {
    // Orange (20-60) - moderate gamut
    return 1.05;
  }
};

// Generate palette for a single base color
export const generatePaletteForColor = (
  baseColorObj,
  numStops,
  mainStopIndex,
  colorMode,
  easingType,
  lightest,
  darkest,
  preservePerceptualBrightness
) => {
  // If this color has pinned exact stops and count matches, use them directly
  if (baseColorObj.customStops && baseColorObj.customStops.length === numStops) {
    return baseColorObj.customStops.map((hex, i) => ({
      hex,
      oklch: '',
      isBase: i === mainStopIndex
    }));
  }

  const rgb = hexToRgb(baseColorObj.color);
  if (!rgb) return [];

  if (colorMode === 'oklch') {
    const baseOklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
    const colors = [];

    // When preserving perceptual brightness, calculate target luminance range
    let lightnessOffset = 0;
    let lightnessScale = 1.0;

    if (preservePerceptualBrightness) {
      // Each half of the ramp spans the full [darkest, lightest] range, so the
      // "normal" endpoints we remap from are simply those bounds.
      const normalLightest = lightest;
      const normalDarkest = darkest;

      // Calculate reference luminances at these lightness values using green (120°)
      const referenceHue = 120;
      const refLightestRgb = oklchToRgbGamutMapped(normalLightest, baseOklch.c, referenceHue);
      const refDarkestRgb = oklchToRgbGamutMapped(normalDarkest, baseOklch.c, referenceHue);
      const targetLightestLuminance = getLuminance(refLightestRgb.r, refLightestRgb.g, refLightestRgb.b);
      const targetDarkestLuminance = getLuminance(refDarkestRgb.r, refDarkestRgb.g, refDarkestRgb.b);

      // Find what lightness values produce these luminances for our hue
      const adjustedLightest = findLightnessForLuminance(targetLightestLuminance, baseOklch.c, baseOklch.h);
      const adjustedDarkest = findLightnessForLuminance(targetDarkestLuminance, baseOklch.c, baseOklch.h);

      // Calculate offset and scale to map our normal range to the adjusted range
      const normalRange = normalLightest - normalDarkest;
      const adjustedRange = adjustedLightest - adjustedDarkest;

      if (normalRange > 0) {
        lightnessScale = adjustedRange / normalRange;
        lightnessOffset = adjustedDarkest - (normalDarkest * lightnessScale);
      }
    }

    for (let i = 0; i < numStops; i++) {
      let lightness;

      if (i === mainStopIndex) {
        // This is the base color
        lightness = baseOklch.l;
      } else {
        // Absolute displayable bounds
        const minBound = darkest;
        const maxBound = lightest;

        // Distribute each half of the ramp independently so the lightest stop
        // always reaches `lightest` and the darkest stop always reaches
        // `darkest`, no matter where the base color's lightness falls. This is
        // what keeps the perceived light/dark ramp consistent across hues:
        // light hues (green, yellow, cyan) now get just as dark at the bottom
        // as naturally-darker hues (red, magenta, blue).
        const lighterSteps = mainStopIndex;                 // stops above the base
        const darkerSteps = (numStops - 1) - mainStopIndex; // stops below the base

        if (i < mainStopIndex) {
          // Lighter than base: interpolate base -> lightest
          const progress = lighterSteps > 0 ? (mainStopIndex - i) / lighterSteps : 0;
          lightness = baseOklch.l + (maxBound - baseOklch.l) * applyEasing(progress, easingType);
        } else {
          // Darker than base: interpolate base -> darkest
          const progress = darkerSteps > 0 ? (i - mainStopIndex) / darkerSteps : 0;
          lightness = baseOklch.l + (minBound - baseOklch.l) * applyEasing(progress, easingType);
        }

        // Final safety clamp
        lightness = Math.max(minBound, Math.min(maxBound, lightness));

        // Apply perceptual brightness adjustment (scale and offset)
        if (preservePerceptualBrightness) {
          lightness = (lightness * lightnessScale) + lightnessOffset;
          lightness = Math.max(minBound, Math.min(maxBound, lightness));
        }
      }

      // Use the base color's chroma, with adaptive reduction at extremes
      let chroma = baseOklch.c;

      // When preserving perceptual brightness, adjust chroma reduction based on hue
      // Different strategies for dark vs bright extremes
      let darkReductionFactor = 1.0;
      let brightReductionFactor = 1.0;

      if (preservePerceptualBrightness) {
        const h = ((baseOklch.h % 360) + 360) % 360;

        // Yellows/greens: need MORE reduction at dark end, moderate at bright end
        if (h >= 60 && h <= 140) {
          darkReductionFactor = 1.5; // More aggressive for yellow-green darks
          brightReductionFactor = 0.5; // Moderate for bright yellows
        }
        // Blues/purples: need LESS reduction at both ends to maintain brightness
        else if (h >= 200 && h <= 280) {
          darkReductionFactor = 0.3; // Less aggressive for blue-purple darks
          brightReductionFactor = 0.15; // Much less aggressive for brights (keep saturation)
        }
        // Other hues: moderate reduction
        else {
          darkReductionFactor = 0.8; // Moderate for other darks
          brightReductionFactor = 0.3; // Standard for other brights
        }
      }

      if (lightness > 0.85) {
        const reduction = (lightness - 0.85) / (0.95 - 0.85);
        chroma = chroma * (1 - reduction * 0.6 * brightReductionFactor);
      }

      // Reduce chroma at very low lightness, but less aggressively when user wants dark colors
      if (lightness < 0.25) {
        // When user sets darkest < 0.05, they want truly dark colors, so reduce less
        const userWantsDarkColors = darkest < 0.05;
        const reduction = Math.min(1.0, (0.25 - lightness) / (0.25 - 0.12));
        const reductionAmount = userWantsDarkColors ? 0.3 : 0.5;
        const finalReduction = Math.min(0.95, reduction * reductionAmount * darkReductionFactor);
        chroma = chroma * (1 - finalReduction);
      }

      const resultRgb = oklchToRgbGamutMapped(lightness, chroma, baseOklch.h);
      const hex = rgbToHex(resultRgb.r, resultRgb.g, resultRgb.b);

      colors.push({
        hex,
        oklch: `oklch(${(lightness * 100).toFixed(1)}% ${chroma.toFixed(3)} ${baseOklch.h.toFixed(1)})`,
        isBase: i === mainStopIndex
      });
    }

    return colors;
  } else {
    // HSL mode
    const baseHsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors = [];

    for (let i = 0; i < numStops; i++) {
      let lightness;

      if (i === mainStopIndex) {
        // This is the base color
        lightness = baseHsl.l;
      } else {
        // Absolute displayable bounds (HSL blows out at very high lightness)
        const minBound = darkest;
        const maxBound = lightest * 0.97;

        // Independent halves so every hue spans the full range to both bounds.
        const lighterSteps = mainStopIndex;
        const darkerSteps = (numStops - 1) - mainStopIndex;

        if (i < mainStopIndex) {
          const progress = lighterSteps > 0 ? (mainStopIndex - i) / lighterSteps : 0;
          lightness = baseHsl.l + (maxBound - baseHsl.l) * applyEasing(progress, easingType);
        } else {
          const progress = darkerSteps > 0 ? (i - mainStopIndex) / darkerSteps : 0;
          lightness = baseHsl.l + (minBound - baseHsl.l) * applyEasing(progress, easingType);
        }

        // Final safety clamp
        lightness = Math.max(minBound, Math.min(maxBound, lightness));
      }

      // Use base saturation with adaptive reduction at extremes
      let saturation = baseHsl.s;

      // When preserving perceptual brightness, reduce saturation reduction
      const reductionFactor = preservePerceptualBrightness ? 0.3 : 1.0;

      if (lightness > 0.82) {
        const reduction = (lightness - 0.82) / (0.92 - 0.82);
        saturation = saturation * (1 - reduction * 0.5 * reductionFactor);
      }

      if (lightness < 0.25) {
        const reduction = (0.25 - lightness) / (0.25 - 0.12);
        saturation = saturation * (1 - reduction * 0.45 * reductionFactor);
      }

      const resultRgb = hslToRgb(baseHsl.h, saturation, lightness);
      const hex = rgbToHex(resultRgb.r, resultRgb.g, resultRgb.b);

      colors.push({
        hex,
        oklch: `hsl(${baseHsl.h.toFixed(1)}deg ${(saturation * 100).toFixed(1)}% ${(lightness * 100).toFixed(1)}%)`,
        isBase: i === mainStopIndex
      });
    }

    return colors;
  }
};
