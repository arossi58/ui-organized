import { hexToRgb, rgbToHsl, rgbToOklch } from './colorConversions';

// Generate color name from hue, saturation, and lightness
export const getColorNameFromHSL = (h, s, l) => {
  // Determine if color is grayscale (low saturation)
  if (s < 0.1) {
    if (l > 0.95) return 'White';
    if (l > 0.85) return 'Snow';
    if (l > 0.75) return 'Gainsboro';
    if (l > 0.65) return 'Silver';
    if (l > 0.50) return 'Gray';
    if (l > 0.35) return 'Slate';
    if (l > 0.20) return 'Charcoal';
    return 'Black';
  }

  // Determine lightness category
  const isVeryLight = l > 0.80;
  const isLight = l > 0.60;
  const isDark = l < 0.35;
  const isVeryDark = l < 0.20;

  // Determine saturation category
  const isVibrant = s > 0.6;
  const isMuted = s < 0.4;

  // Red family (345-15)
  if ((h >= 345 && h <= 360) || (h >= 0 && h < 15)) {
    if (isVeryLight) return 'Misty Rose';
    if (isLight && isMuted) return 'Rose';
    if (isLight) return 'Salmon';
    if (isDark && isVibrant) return 'Crimson';
    if (isDark) return 'Maroon';
    if (isVibrant) return 'Red';
    return 'Coral';
  }

  // Orange-Red (15-30)
  if (h >= 15 && h < 30) {
    if (isVeryLight) return 'Peach';
    if (isLight) return 'Coral';
    if (isDark) return 'Sienna';
    if (isVibrant) return 'Tomato';
    return 'Terracotta';
  }

  // Orange (30-45)
  if (h >= 30 && h < 45) {
    if (isVeryLight) return 'Papaya';
    if (isLight) return 'Apricot';
    if (isDark) return 'Rust';
    if (isVibrant) return 'Orange';
    return 'Tangerine';
  }

  // Yellow-Orange (45-60)
  if (h >= 45 && h < 60) {
    if (isVeryLight) return 'Cream';
    if (isLight) return 'Sand';
    if (isDark) return 'Bronze';
    if (isVibrant) return 'Amber';
    return 'Gold';
  }

  // Yellow (60-75)
  if (h >= 60 && h < 75) {
    if (isVeryLight) return 'Ivory';
    if (isLight) return 'Lemon';
    if (isDark) return 'Olive';
    if (isVibrant) return 'Yellow';
    return 'Canary';
  }

  // Yellow-Green (75-90)
  if (h >= 75 && h < 90) {
    if (isVeryLight) return 'Honeydew';
    if (isLight) return 'Pistachio';
    if (isDark) return 'Olive';
    if (isVibrant) return 'Chartreuse';
    return 'Lime';
  }

  // Green (90-150)
  if (h >= 90 && h < 150) {
    if (isVeryLight) return 'Mint';
    if (isLight && h < 120) return 'Sage';
    if (isLight) return 'Seafoam';
    if (isDark && h < 120) return 'Forest';
    if (isDark) return 'Hunter';
    if (isVibrant && h < 120) return 'Emerald';
    if (isVibrant) return 'Jade';
    if (isMuted) return 'Moss';
    return 'Green';
  }

  // Cyan (150-195)
  if (h >= 150 && h < 195) {
    if (isVeryLight) return 'Azure';
    if (isLight) return 'Aqua';
    if (isDark) return 'Teal';
    if (isVibrant) return 'Turquoise';
    return 'Cyan';
  }

  // Blue (195-255)
  if (h >= 195 && h < 255) {
    if (isVeryLight) return 'Sky';
    if (isLight && isMuted) return 'Powder';
    if (isLight) return 'Cornflower';
    if (isDark && isVibrant) return 'Navy';
    if (isDark) return 'Midnight';
    if (isVibrant && h < 225) return 'Azure';
    if (isVibrant) return 'Royal';
    if (isMuted) return 'Steel';
    return 'Blue';
  }

  // Indigo/Purple (255-285)
  if (h >= 255 && h < 285) {
    if (isVeryLight) return 'Lavender';
    if (isLight) return 'Periwinkle';
    if (isDark) return 'Indigo';
    if (isVibrant) return 'Violet';
    return 'Purple';
  }

  // Magenta/Pink (285-315)
  if (h >= 285 && h < 315) {
    if (isVeryLight) return 'Orchid';
    if (isLight) return 'Lilac';
    if (isDark) return 'Plum';
    if (isVibrant) return 'Magenta';
    return 'Fuchsia';
  }

  // Pink/Rose (315-345)
  if (h >= 315 && h < 345) {
    if (isVeryLight) return 'Blush';
    if (isLight) return 'Pink';
    if (isDark) return 'Berry';
    if (isVibrant) return 'Hot Pink';
    return 'Rose';
  }

  return 'Color';
};

// Get stop names based on naming system
export const getStopNames = (numStops, namingSystem, customIncrement) => {
  switch (namingSystem) {
    case 'tailwind':
      // Tailwind: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
      if (numStops === 11) return ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
      if (numStops === 10) return ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
      if (numStops === 9) return ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
      // For other counts, distribute across the scale
      return Array.from({ length: numStops }, (_, i) => {
        const value = Math.round(50 + (900 / (numStops - 1)) * i);
        return Math.round(value / 50) * 50 + '';
      });

    case 'material':
      // Material: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
      if (numStops === 10) return ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
      if (numStops === 9) return ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
      return Array.from({ length: numStops }, (_, i) => {
        const value = Math.round(50 + (900 / (numStops - 1)) * i);
        return Math.round(value / 50) * 50 + '';
      });

    case 'radix':
      // Radix: 1-12
      return Array.from({ length: numStops }, (_, i) => (i + 1).toString());

    case 'custom':
      // Custom: count by increment (1, 10, or 100)
      return Array.from({ length: numStops }, (_, i) => ((i + 1) * customIncrement).toString());

    default:
      return Array.from({ length: numStops }, (_, i) => (i + 1).toString());
  }
};

// Format color for display based on user preference
export const formatColorValue = (hex, displayFormat) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  switch (displayFormat) {
    case 'rgb':
      return `rgb(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)})`;

    case 'hsl':
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return `hsl(${Math.round(hsl.h)}°, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`;

    case 'oklch':
      const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
      return `oklch(${(oklch.l * 100).toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)}°)`;

    case 'hex':
    default:
      return hex.toUpperCase();
  }
};
