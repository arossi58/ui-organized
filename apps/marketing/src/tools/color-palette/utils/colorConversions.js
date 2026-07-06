// Convert hex to RGB
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
};

// RGB to Hex
export const rgbToHex = (r, g, b) => {
  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Convert RGB to linear RGB
export const rgbToLinear = (c) => {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

// Convert linear RGB to RGB
export const linearToRgb = (c) => {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
};

// RGB to OKLCH conversion
export const rgbToOklch = (r, g, b) => {
  // Convert to linear RGB
  const lr = rgbToLinear(r);
  const lg = rgbToLinear(g);
  const lb = rgbToLinear(b);

  // Convert to OKLab
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // Convert to LCH
  const C = Math.sqrt(a * a + b_ * b_);
  let H = Math.atan2(b_, a) * 180 / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
};

// OKLCH to RGB conversion
export const oklchToRgb = (l, c, h) => {
  const hRad = h * Math.PI / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const lr = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const lg = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const lb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  const r = linearToRgb(lr);
  const g = linearToRgb(lg);
  const b_ = linearToRgb(lb);

  return {
    r: Math.max(0, Math.min(1, r)),
    g: Math.max(0, Math.min(1, g)),
    b: Math.max(0, Math.min(1, b_))
  };
};

// Check if RGB values are within gamut (0-1 range)
export const isInGamut = (r, g, b) => {
  return r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1;
};

// Convert OKLCH to RGB with gamut mapping to prevent hue shifts
export const oklchToRgbGamutMapped = (l, c, h) => {
  // First try with full chroma
  const hRad = h * Math.PI / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const lr = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const lg = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const lb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  let r = linearToRgb(lr);
  let g = linearToRgb(lg);
  let b_ = linearToRgb(lb);

  // If in gamut, return as is
  if (isInGamut(r, g, b_)) {
    return { r, g, b: b_ };
  }

  // Binary search to find maximum chroma that stays in gamut
  let minChroma = 0;
  let maxChroma = c;
  let testChroma = c;
  const epsilon = 0.0001;
  let iterations = 0;
  const maxIterations = 20;

  while (maxChroma - minChroma > epsilon && iterations < maxIterations) {
    testChroma = (minChroma + maxChroma) / 2;

    const testA = testChroma * Math.cos(hRad);
    const testB = testChroma * Math.sin(hRad);

    const test_l_ = l + 0.3963377774 * testA + 0.2158037573 * testB;
    const test_m_ = l - 0.1055613458 * testA - 0.0638541728 * testB;
    const test_s_ = l - 0.0894841775 * testA - 1.2914855480 * testB;

    const test_l3 = test_l_ * test_l_ * test_l_;
    const test_m3 = test_m_ * test_m_ * test_m_;
    const test_s3 = test_s_ * test_s_ * test_s_;

    const test_lr = +4.0767416621 * test_l3 - 3.3077115913 * test_m3 + 0.2309699292 * test_s3;
    const test_lg = -1.2684380046 * test_l3 + 2.6097574011 * test_m3 - 0.3413193965 * test_s3;
    const test_lb = -0.0041960863 * test_l3 - 0.7034186147 * test_m3 + 1.7076147010 * test_s3;

    const test_r = linearToRgb(test_lr);
    const test_g = linearToRgb(test_lg);
    const test_b = linearToRgb(test_lb);

    if (isInGamut(test_r, test_g, test_b)) {
      minChroma = testChroma;
      r = test_r;
      g = test_g;
      b_ = test_b;
    } else {
      maxChroma = testChroma;
    }

    iterations++;
  }

  return { r, g, b: b_ };
};

// Whether an OKLCH triple is reproducible in the sRGB gamut (i.e. displayable
// on typical hardware) without clamping. Mirrors the linear-RGB math in
// oklchToRgb but tests the *unclamped* channels against the 0–1 range.
export const isOklchInGamut = (l, c, h) => {
  const hRad = h * Math.PI / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const lr = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const lg = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const lb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  return isInGamut(linearToRgb(lr), linearToRgb(lg), linearToRgb(lb));
};

// RGB to HSL conversion
export const rgbToHsl = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s, l };
};

// HSL to RGB conversion
export const hslToRgb = (h, s, l) => {
  h = h / 360;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  if (s === 0) {
    return { r: l, g: l, b: l };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hue2rgb(p, q, h + 1/3),
    g: hue2rgb(p, q, h),
    b: hue2rgb(p, q, h - 1/3)
  };
};
