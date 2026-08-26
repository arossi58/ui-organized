/**
 * sRGB, HSL and HSB: parsing, conversion and formatting, written out by hand.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 *
 * React, Svelte and Vue get their colour maths from `@zag-js/color-utils`, which
 * the machine uses for everything a ColorPicker says about itself. This package
 * has no zag and may take no third-party dependency beyond the CDK, so the
 * choice is between writing the conversions and shipping a picker that cannot
 * name the colour it is showing.
 *
 * It is not decorative maths. Every one of these values is **compared** by the
 * parity gate, because the machine writes the colour into the accessibility
 * tree in four different notations at once:
 *
 *     aria-label="select color. current color is rgba(37, 99, 235, 1)"   trigger
 *     data-value="#2563EB"                                          value swatch
 *     aria-valuenow="221.21"  aria-valuetext="hue 221.21"              hue thumb
 *     aria-valuetext="saturation 84.26, brightness 92.16"             area thumb
 *
 * Those four come from three different colour spaces and two different rounding
 * rules. A conversion that is a hundredth out reads differently to a screen
 * reader and fails the gate, which is exactly the point of writing it down
 * rather than approximating it.
 *
 * ── Sources ─────────────────────────────────────────────────────────────────
 *
 * The conversions are the standard ones, from the derivations in the Wikipedia
 * article "HSL and HSV" (§"From RGB", §"HSV to RGB alternative", §"HSL to RGB
 * alternative", §"HSV to HSL") — which is the same reference `@zag-js/color-utils`
 * names, deliberately: the alternative formulations differ in floating-point
 * behaviour, and a different-but-equivalent derivation would round differently
 * in the last place and disagree with the other three libraries.
 *
 * The two rules that are *not* in the maths, and matter as much:
 *
 *  - Every converted channel is rounded to **two decimal places**, and alpha
 *    with it. That is why a hue reads `221.21` rather than `221.21212121`.
 *  - A conversion **to** RGB rounds each channel to a whole number, because a
 *    byte is what sRGB stores.
 *
 * The named-colour table is CSS Color Module Level 4 §6.1 ("Named Colors"),
 * transcribed as data.
 *
 * ── And it is checked, not merely written ───────────────────────────────────
 *
 * `color.spec.ts` holds values read out of a **running** `@ark-ui/react`
 * ColorPicker in Chromium — the aria attributes above, for a range of colours
 * and in all three notations the component supports — and asserts this file
 * reproduces them. It also round-trips every one back through the other two
 * spaces, because a conversion that is self-consistent and wrong is the failure
 * a reference table catches and a symmetry test does not.
 */

export type ColorFormat = "rgba" | "hsla" | "hsba";
/** The notations `colorToString` can print. `css` is each space's own default. */
export type ColorNotation = ColorFormat | "rgb" | "hsl" | "hsb" | "hex" | "hexa" | "css";

export interface RgbaColor {
  format: "rgba";
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

export interface HslaColor {
  format: "hsla";
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
}

export interface HsbaColor {
  format: "hsba";
  hue: number;
  saturation: number;
  brightness: number;
  alpha: number;
}

export type ColorValue = RgbaColor | HslaColor | HsbaColor;

/** A channel's bounds, which is what a slider thumb reports as its range. */
export interface ChannelRange {
  minValue: number;
  maxValue: number;
  step: number;
}

/**
 * Round to `places` decimal places.
 *
 * The rounding rule the whole file depends on, and the reason it is a named
 * function rather than an inline `Math.round(x * 100) / 100`: every converted
 * channel goes through it, and a single place that forgot would be a hue that
 * reads `221.2121212121212` in one library and `221.21` in three.
 */
export const roundTo = (value: number, places = 0): number => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(Number.isNaN(value) ? 0 : value, low), high);

/** Positive modulo, so a hue of -10° comes back as 350° rather than -10°. */
const mod = (value: number, m: number) => ((value % m) + m) % m;

const HEX_COLOR = /^#[\da-f]+$/i;
const RGB_COLOR = /^rgba?\((.*)\)$/;
const HSL_COLOR =
  /hsl\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%)\)|hsla\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d(.\d+)?)\)/;
const HSB_COLOR =
  /hsb\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%)\)|hsba\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d(.\d+)?)\)/;

/**
 * CSS Color Module Level 4 §6.1, "Named Colors", as `name:rrggbb` pairs.
 *
 * A table rather than a lookup through the browser, so that a colour parses the
 * same way in a unit test, in a server render and on a page — and so that the
 * answer cannot depend on which engine is asked.
 */
const NAMED_COLORS =
  "aliceblue:f0f8ff,antiquewhite:faebd7,aqua:00ffff,aquamarine:7fffd4,azure:f0ffff," +
  "beige:f5f5dc,bisque:ffe4c4,black:000000,blanchedalmond:ffebcd,blue:0000ff," +
  "blueviolet:8a2be2,brown:a52a2a,burlywood:deb887,cadetblue:5f9ea0,chartreuse:7fff00," +
  "chocolate:d2691e,coral:ff7f50,cornflowerblue:6495ed,cornsilk:fff8dc,crimson:dc143c," +
  "cyan:00ffff,darkblue:00008b,darkcyan:008b8b,darkgoldenrod:b8860b,darkgray:a9a9a9," +
  "darkgreen:006400,darkkhaki:bdb76b,darkmagenta:8b008b,darkolivegreen:556b2f," +
  "darkorange:ff8c00,darkorchid:9932cc,darkred:8b0000,darksalmon:e9967a," +
  "darkseagreen:8fbc8f,darkslateblue:483d8b,darkslategray:2f4f4f,darkturquoise:00ced1," +
  "darkviolet:9400d3,deeppink:ff1493,deepskyblue:00bfff,dimgray:696969,dodgerblue:1e90ff," +
  "firebrick:b22222,floralwhite:fffaf0,forestgreen:228b22,fuchsia:ff00ff," +
  "gainsboro:dcdcdc,ghostwhite:f8f8ff,gold:ffd700,goldenrod:daa520,gray:808080," +
  "green:008000,greenyellow:adff2f,honeydew:f0fff0,hotpink:ff69b4,indianred:cd5c5c," +
  "indigo:4b0082,ivory:fffff0,khaki:f0e68c,lavender:e6e6fa,lavenderblush:fff0f5," +
  "lawngreen:7cfc00,lemonchiffon:fffacd,lightblue:add8e6,lightcoral:f08080," +
  "lightcyan:e0ffff,lightgoldenrodyellow:fafad2,lightgrey:d3d3d3,lightgreen:90ee90," +
  "lightpink:ffb6c1,lightsalmon:ffa07a,lightseagreen:20b2aa,lightskyblue:87cefa," +
  "lightslategray:778899,lightsteelblue:b0c4de,lightyellow:ffffe0,lime:00ff00," +
  "limegreen:32cd32,linen:faf0e6,magenta:ff00ff,maroon:800000,mediumaquamarine:66cdaa," +
  "mediumblue:0000cd,mediumorchid:ba55d3,mediumpurple:9370d8,mediumseagreen:3cb371," +
  "mediumslateblue:7b68ee,mediumspringgreen:00fa9a,mediumturquoise:48d1cc," +
  "mediumvioletred:c71585,midnightblue:191970,mintcream:f5fffa,mistyrose:ffe4e1," +
  "moccasin:ffe4b5,navajowhite:ffdead,navy:000080,oldlace:fdf5e6,olive:808000," +
  "olivedrab:6b8e23,orange:ffa500,orangered:ff4500,orchid:da70d6,palegoldenrod:eee8aa," +
  "palegreen:98fb98,paleturquoise:afeeee,palevioletred:d87093,papayawhip:ffefd5," +
  "peachpuff:ffdab9,peru:cd853f,pink:ffc0cb,plum:dda0dd,powderblue:b0e0e6,purple:800080," +
  "rebeccapurple:663399,red:ff0000,rosybrown:bc8f8f,royalblue:4169e1,saddlebrown:8b4513," +
  "salmon:fa8072,sandybrown:f4a460,seagreen:2e8b57,seashell:fff5ee,sienna:a0522d," +
  "silver:c0c0c0,skyblue:87ceeb,slateblue:6a5acd,slategray:708090,snow:fffafa," +
  "springgreen:00ff7f,steelblue:4682b4,tan:d2b48c,teal:008080,thistle:d8bfd8," +
  "tomato:ff6347,turquoise:40e0d0,violet:ee82ee,wheat:f5deb3,white:ffffff," +
  "whitesmoke:f5f5f5,yellow:ffff00,yellowgreen:9acd32";

const NAMED_COLOR_MAP = new Map(
  NAMED_COLORS.split(",").map((pair) => {
    const [name, hex] = pair.split(":");
    return [name!, `#${hex!}`] as const;
  }),
);

/**
 * Parse any CSS colour this component accepts.
 *
 * Throws rather than returning a fallback, which is deliberate and is what the
 * other three libraries do: a picker silently showing black because someone
 * typed `#gg0000` is worse than one that says so.
 */
export function parseColor(value: string): ColorValue {
  const named = NAMED_COLOR_MAP.get(value);
  if (named) return parseColor(named);
  const parsed = parseRgb(value) ?? parseHsb(value) ?? parseHsl(value);
  if (!parsed) throw new Error(`Invalid color value: ${value}`);
  return parsed;
}

function parseRgb(value: string): RgbaColor | undefined {
  let channels: number[] | undefined;

  // 4, 5, 7 and 9 characters: #rgb, #rgba, #rrggbb, #rrggbbaa. Anything else of
  // the right shape is not a hex colour, however hexadecimal it looks — and
  // splitting one into bytes anyway reads `#abcde` as two and a half channels.
  if (HEX_COLOR.test(value) && [4, 5, 7, 9].includes(value.length)) {
    // Each digit doubles in the short forms, so `#abc` is `#aabbcc`.
    const digits = (value.length < 6 ? value.replace(/[^#]/gi, "$&$&") : value).slice(1).split("");
    const bytes: number[] = [];
    while (digits.length > 0) {
      bytes.push(parseInt(digits.splice(0, 2).join(""), 16));
    }
    // The fourth byte is alpha out of 255 rather than out of 1, which is why
    // `#2563eb80` has an alpha of 0.5019607843137255 and not 0.5.
    channels = bytes.length === 4 ? [...bytes.slice(0, 3), bytes[3]! / 255] : bytes;
  }

  const match = value.match(RGB_COLOR);
  if (match?.[1]) {
    channels = match[1]
      .split(",")
      .map((part) => Number(part.trim()))
      .map((num, index) => clamp(num, 0, index < 3 ? 255 : 1));
  }

  if (!channels || channels.length < 3) return undefined;
  return {
    format: "rgba",
    red: channels[0]!,
    green: channels[1]!,
    blue: channels[2]!,
    alpha: channels[3] ?? 1,
  };
}

function parseHsl(value: string): HslaColor | undefined {
  const match = value.match(HSL_COLOR);
  if (!match) return undefined;
  const [hue, saturation, lightness, alpha] = (match[1] ?? match[2])!
    .split(",")
    .map((part) => Number(part.trim().replace("%", "")));
  return {
    format: "hsla",
    hue: mod(hue!, 360),
    saturation: clamp(saturation!, 0, 100),
    lightness: clamp(lightness!, 0, 100),
    alpha: clamp(alpha ?? 1, 0, 1),
  };
}

function parseHsb(value: string): HsbaColor | undefined {
  const match = value.match(HSB_COLOR);
  if (!match) return undefined;
  const [hue, saturation, brightness, alpha] = (match[1] ?? match[2])!
    .split(",")
    .map((part) => Number(part.trim().replace("%", "")));
  return {
    format: "hsba",
    hue: mod(hue!, 360),
    saturation: clamp(saturation!, 0, 100),
    brightness: clamp(brightness!, 0, 100),
    alpha: clamp(alpha ?? 1, 0, 1),
  };
}

/**
 * sRGB to HSB (HSV).
 *
 * "HSL and HSV", §From RGB: the hue is the angle around the colour hexagon,
 * found from whichever channel is largest; the saturation is how far the chroma
 * has travelled towards that maximum; the brightness *is* the maximum.
 */
export function rgbToHsb(color: RgbaColor): HsbaColor {
  const red = color.red / 255;
  const green = color.green / 255;
  const blue = color.blue / 255;
  const min = Math.min(red, green, blue);
  const brightness = Math.max(red, green, blue);
  const chroma = brightness - min;
  const saturation = brightness === 0 ? 0 : chroma / brightness;
  return {
    format: "hsba",
    hue: roundTo(hueOf(red, green, blue, brightness, chroma) * 360, 2),
    saturation: roundTo(saturation * 100, 2),
    brightness: roundTo(brightness * 100, 2),
    alpha: roundTo(color.alpha, 2),
  };
}

/**
 * sRGB to HSL.
 *
 * Same hue, a different second and third axis: lightness is the midpoint of the
 * largest and smallest channels rather than the largest, and the saturation is
 * measured against how much room is left at that lightness — which is why the
 * denominator changes sign about `lightness = 0.5`.
 */
export function rgbToHsl(color: RgbaColor): HslaColor {
  const red = color.red / 255;
  const green = color.green / 255;
  const blue = color.blue / 255;
  const min = Math.min(red, green, blue);
  const max = Math.max(red, green, blue);
  const lightness = (max + min) / 2;
  const chroma = max - min;
  const saturation =
    chroma === 0 ? 0 : chroma / (lightness < 0.5 ? max + min : 2 - max - min);
  return {
    format: "hsla",
    hue: roundTo(hueOf(red, green, blue, max, chroma) * 360, 2),
    saturation: roundTo(saturation * 100, 2),
    lightness: roundTo(lightness * 100, 2),
    alpha: roundTo(color.alpha, 2),
  };
}

/**
 * The hue, in turns, shared by both conversions above.
 *
 * The `+ 6` on the red branch is what keeps the result positive when green is
 * below blue — the sector below the red axis is the *last* sixth of the wheel,
 * not a negative first one.
 */
function hueOf(
  red: number,
  green: number,
  blue: number,
  max: number,
  chroma: number,
): number {
  if (chroma === 0) return 0;
  let hue: number;
  if (max === red) hue = (green - blue) / chroma + (green < blue ? 6 : 0);
  else if (max === green) hue = (blue - red) / chroma + 2;
  else hue = (red - green) / chroma + 4;
  return hue / 6;
}

/** HSB to HSL: the same colour, re-expressed about its midpoint. */
export function hsbToHsl(color: HsbaColor): HslaColor {
  const saturation = color.saturation / 100;
  const brightness = color.brightness / 100;
  const lightness = brightness * (1 - saturation / 2);
  const hslSaturation =
    lightness === 0 || lightness === 1
      ? 0
      : (brightness - lightness) / Math.min(lightness, 1 - lightness);
  return {
    format: "hsla",
    hue: roundTo(color.hue, 2),
    saturation: roundTo(hslSaturation * 100, 2),
    lightness: roundTo(lightness * 100, 2),
    alpha: roundTo(color.alpha, 2),
  };
}

/** HSL to HSB, the inverse of the above. */
export function hslToHsb(color: HslaColor): HsbaColor {
  const saturation = color.saturation / 100;
  const lightness = color.lightness / 100;
  const brightness = lightness + saturation * Math.min(lightness, 1 - lightness);
  const hsbSaturation = brightness === 0 ? 0 : 2 * (1 - lightness / brightness);
  return {
    format: "hsba",
    hue: roundTo(color.hue, 2),
    saturation: roundTo(hsbSaturation * 100, 2),
    brightness: roundTo(brightness * 100, 2),
    alpha: roundTo(color.alpha, 2),
  };
}

/**
 * HSB to sRGB, by the alternative formulation.
 *
 * The three channels are the same function `f` sampled at n = 5, 3 and 1, which
 * is the piecewise sextant definition folded into one expression — and folding
 * it is not a tidying: the piecewise form branches on the hue sector and lands
 * on the other side of a rounding boundary at the sector edges.
 */
export function hsbToRgb(color: HsbaColor): RgbaColor {
  const saturation = color.saturation / 100;
  const brightness = color.brightness / 100;
  const f = (n: number): number => {
    const k = (n + color.hue / 60) % 6;
    return brightness - saturation * brightness * Math.max(Math.min(k, 4 - k, 1), 0);
  };
  return {
    format: "rgba",
    red: Math.round(f(5) * 255),
    green: Math.round(f(3) * 255),
    blue: Math.round(f(1) * 255),
    alpha: roundTo(color.alpha, 2),
  };
}

/** HSL to sRGB, the same folded sampling at n = 0, 8 and 4. */
export function hslToRgb(color: HslaColor): RgbaColor {
  const saturation = color.saturation / 100;
  const lightness = color.lightness / 100;
  const a = saturation * Math.min(lightness, 1 - lightness);
  const f = (n: number): number => {
    const k = (n + color.hue / 30) % 12;
    return lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return {
    format: "rgba",
    red: Math.round(f(0) * 255),
    green: Math.round(f(8) * 255),
    blue: Math.round(f(4) * 255),
    alpha: roundTo(color.alpha, 2),
  };
}

/** Re-express a colour in another space, going through RGB where it must. */
export function toColorFormat(color: ColorValue, format: ColorFormat): ColorValue {
  if (color.format === format) return color;
  if (color.format === "rgba") return format === "hsba" ? rgbToHsb(color) : rgbToHsl(color);
  if (color.format === "hsba") return format === "rgba" ? hsbToRgb(color) : hsbToHsl(color);
  return format === "rgba" ? hslToRgb(color) : hslToHsb(color);
}

const toRgb = (color: ColorValue): RgbaColor => toColorFormat(color, "rgba") as RgbaColor;

const hexByte = (value: number) => value.toString(16).padStart(2, "0");

/**
 * Print a colour.
 *
 * Note what is *not* symmetrical: hex comes out upper case (which is what
 * `data-value` carries), while `rgba()` and `hsla()` print their numbers as
 * JavaScript stringifies them — so an alpha of 1 is `1` and never `1.00`.
 */
export function colorToString(color: ColorValue, notation: ColorNotation = "css"): string {
  switch (notation) {
    case "hex": {
      const rgb = toRgb(color);
      return `#${(hexByte(rgb.red) + hexByte(rgb.green) + hexByte(rgb.blue)).toUpperCase()}`;
    }
    case "hexa": {
      const rgb = toRgb(color);
      return `#${(
        hexByte(rgb.red) +
        hexByte(rgb.green) +
        hexByte(rgb.blue) +
        hexByte(Math.round(rgb.alpha * 255))
      ).toUpperCase()}`;
    }
    case "rgb": {
      const rgb = toRgb(color);
      return `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`;
    }
    case "rgba": {
      const rgb = toRgb(color);
      return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${rgb.alpha})`;
    }
    case "hsl":
    case "hsla": {
      const hsl = toColorFormat(color, "hsla") as HslaColor;
      const body = `${hsl.hue}, ${roundTo(hsl.saturation, 2)}%, ${roundTo(hsl.lightness, 2)}%`;
      return notation === "hsl" ? `hsl(${body})` : `hsla(${body}, ${hsl.alpha})`;
    }
    case "hsb":
    case "hsba": {
      const hsb = toColorFormat(color, "hsba") as HsbaColor;
      const body = `${hsb.hue}, ${roundTo(hsb.saturation, 2)}%, ${roundTo(hsb.brightness, 2)}%`;
      return notation === "hsb" ? `hsb(${body})` : `hsba(${body}, ${hsb.alpha})`;
    }
    default:
      /**
       * `css` is each space's *own* default notation, with one exception that
       * is not a slip: HSB has no CSS syntax at all, so an HSB colour prints as
       * `hsla()`. That is what the machine does, and it is why the root's
       * `--value` is never `hsba(…)`.
       */
      if (color.format === "rgba") return colorToString(color, "rgba");
      return colorToString(color, "hsla");
  }
}

/** The channels each space exposes, in the order the area and sliders read them. */
export function colorChannels(format: ColorFormat): string[] {
  if (format === "rgba") return ["red", "green", "blue"];
  if (format === "hsla") return ["hue", "saturation", "lightness"];
  return ["hue", "saturation", "brightness"];
}

export function channelValue(color: ColorValue, channel: string): number {
  const value = (color as unknown as Record<string, number>)[channel];
  if (typeof value !== "number") {
    throw new Error(`Unsupported color channel: ${channel}`);
  }
  return value;
}

/** A channel's slider range, which reaches the DOM as aria-valuemin/max. */
export function channelRange(channel: string): ChannelRange {
  switch (channel) {
    case "red":
    case "green":
    case "blue":
      return { minValue: 0, maxValue: 255, step: 1 };
    case "hue":
      return { minValue: 0, maxValue: 360, step: 1 };
    case "saturation":
    case "lightness":
    case "brightness":
      return { minValue: 0, maxValue: 100, step: 1 };
    case "alpha":
      return { minValue: 0, maxValue: 1, step: 0.01 };
    default:
      throw new Error(`Unknown color channel: ${channel}`);
  }
}

/** Where a channel sits in its range, 0–1 — the thumb's position on its track. */
export function channelPercent(color: ColorValue, channel: string): number {
  const { minValue, maxValue } = channelRange(channel);
  return (channelValue(color, channel) - minValue) / (maxValue - minValue);
}

/** Replace one channel, clamped into its own range. */
export function withChannelValue(
  color: ColorValue,
  channel: string,
  value: number,
): ColorValue {
  const { minValue, maxValue } = channelRange(channel);
  channelValue(color, channel);
  return { ...color, [channel]: clamp(value, minValue, maxValue) } as ColorValue;
}

/**
 * Whether two colours are the same, in the sense the swatches use.
 *
 * Compared channel by channel in each colour's *own* space rather than through a
 * common one, because a colour converted into another space and back is not
 * always itself — `#2563EB` as hsla is `hsla(221.21, 83.19%, 53.33%, 1)`, which
 * converts back to `rgb(37, 99, 235)` but through numbers that have already been
 * rounded twice. Comparing after a round trip makes a swatch fail to recognise
 * the value it is showing, which is exactly the bug the parity gate has an
 * allowance for on the React and Svelte side.
 */
export function isSameColor(a: ColorValue, b: ColorValue): boolean {
  if (a.format !== b.format) return false;
  const channels = [...colorChannels(a.format), "alpha"];
  return channels.every((channel) => channelValue(a, channel) === channelValue(b, channel));
}
