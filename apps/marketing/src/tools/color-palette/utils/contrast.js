import { hexToRgb } from './colorConversions';

// Calculate relative luminance (Y) for perceived brightness
// Uses sRGB luminance formula
export const getLuminance = (r, g, b) => {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// WCAG 2.x Contrast Calculation
export const getWCAGContrast = (color1, color2) => {
  const getLum = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLum(color1);
  const lum2 = getLum(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

// APCA Contrast Calculation
export const getAPCAContrast = (textColor, bgColor) => {
  const sRGBtoY = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const toLinear = (val) => {
      return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    };

    const r = toLinear(rgb.r);
    const g = toLinear(rgb.g);
    const b = toLinear(rgb.b);

    return 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
  };

  let Ybg = sRGBtoY(bgColor);
  let Ytxt = sRGBtoY(textColor);

  // Soft clamp black
  const blkThrs = 0.022;
  const blkClmp = 1.414;

  if (Ybg < blkThrs) Ybg = Ybg + Math.pow(blkThrs - Ybg, blkClmp);
  if (Ytxt < blkThrs) Ytxt = Ytxt + Math.pow(blkThrs - Ytxt, blkClmp);

  // Calculate SAPC
  const normBg = Math.pow(Ybg, 0.56);
  const normTxt = Math.pow(Ytxt, 0.57);
  const SAPC = normBg - normTxt;

  // Soft clamp the result
  const scale = 1.14;
  if (Math.abs(SAPC) < 0.1) return 0;

  const outputContrast = SAPC > 0
    ? (SAPC - 0.027) * scale
    : (SAPC + 0.027) * scale;

  return Math.abs(outputContrast) * 100;
};

// Get contrast for display
export const getContrast = (fgColor, bgColor, contrastMethod) => {
  if (contrastMethod === 'wcag') {
    const ratio = getWCAGContrast(fgColor, bgColor);
    return {
      value: ratio.toFixed(2),
      label: `${ratio.toFixed(2)}:1`,
      passes: {
        aa: ratio >= 4.5,
        aaLarge: ratio >= 3,
        aaa: ratio >= 7
      }
    };
  } else {
    const lc = getAPCAContrast(fgColor, bgColor);
    return {
      value: lc.toFixed(0),
      label: `Lc ${lc.toFixed(0)}`,
      passes: {
        body: lc >= 60,
        large: lc >= 45,
        display: lc >= 30
      }
    };
  }
};

// Determine best text color (black or white) for a background
export const getBestTextColor = (bgColor) => {
  const contrastWithBlack = getWCAGContrast('#000000', bgColor);
  const contrastWithWhite = getWCAGContrast('#ffffff', bgColor);
  return contrastWithBlack > contrastWithWhite ? '#000000' : '#ffffff';
};
