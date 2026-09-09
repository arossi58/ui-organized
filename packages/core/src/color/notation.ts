/**
 * The colour picker's notation row, described rather than built.
 *
 * Which notations the picker offers, and which fields each one puts under the
 * select, is one answer that four libraries have to give identically — the
 * parity gate compares the popup's markup across all of them. Keeping the table
 * here rather than in each package is what makes that structural instead of a
 * coincidence: a port can only differ in how it reads and writes a channel, not
 * in which channels exist, what they are called, or how far they range.
 *
 * Deliberately declarative. A `read`/`write` pair would have to close over a
 * colour object, and there is no colour object the four share — the three Ark
 * packages hand around `@zag-js/color-utils` `Color`s and Angular computes its
 * own in `color.ts`. So this names the channel and its range, and each library
 * supplies the two lines that fetch and set it.
 */

/**
 * Which notation the row is showing.
 *
 * Not the same set as a picker's `format` prop, which names an *output*
 * notation and includes `hsba`: this is a way of reading the colour, and `hsba`
 * is not a way anyone reads one.
 */
export type ColorNotation = "hex" | "rgb" | "hsl" | "oklch";

export interface ColorNotationOption {
  value: ColorNotation;
  label: string;
}

/** The notations the select offers, in the order it offers them. */
export const COLOR_NOTATIONS: ColorNotationOption[] = [
  { value: "hex", label: "HEX" },
  { value: "rgb", label: "RGB" },
  { value: "hsl", label: "HSL" },
  { value: "oklch", label: "OKLCH" },
];

/**
 * The format the colour *machine* runs on, given the format a caller asked for.
 *
 * The machine models `rgba`/`hsla`/`hsba` and nothing else, so the two notations
 * it cannot hold — hex, which is a rendering of rgba, and OKLCH, which is a
 * different colour space entirely — run on rgba underneath and are converted for
 * display.
 *
 * Framework-neutral because the consequence is: the machine's format decides the
 * hidden input's form value and whether the picker area is saturation×brightness
 * or saturation×lightness. Four libraries deciding that separately is four
 * chances to decide it differently — and three of them had already dropped the
 * mapping, so a picker given `format="hsl"` announced its trigger in a notation
 * React's never used.
 */
export const MACHINE_FORMAT = {
  rgba: "rgba",
  hex: "rgba",
  oklch: "rgba",
  hsla: "hsla",
  hsba: "hsba",
} as const;

/**
 * What a caller may ask the picker to hand back — a superset of the three the
 * machine runs on, which is why the name is not `ColorFormat`.
 */
export type ColorPickerFormat = keyof typeof MACHINE_FORMAT;

/** The channels a numeric field can address, across both spaces plus alpha. */
export type ColorChannelName =
  | "red"
  | "green"
  | "blue"
  | "hue"
  | "saturation"
  | "lightness"
  | "alpha";

interface ColorFieldBase {
  key: string;
  /**
   * The field's accessible name, and — for the numeric channels — the
   * abbreviation printed under the box the way a spec sheet prints one.
   */
  label: string;
}

/**
 * A numeric channel, read and written in `space` whatever space the machine
 * itself is holding the colour in. `space: null` is alpha, the one channel
 * every notation shares and the only one that survives a conversion untouched.
 */
export interface ColorChannelField extends ColorFieldBase {
  kind: "channel";
  space: "rgba" | "hsla" | null;
  channel: ColorChannelName;
  min: number;
  max: number;
  step: number;
  /** Decimal places the printed value keeps. */
  places: number;
}

/**
 * A free-text field holding the whole colour — hex and OKLCH. It prints no
 * abbreviation (the select beside it already says which notation it is) and
 * takes the width the numeric channels would have shared.
 */
export interface ColorTextField extends ColorFieldBase {
  kind: "text";
}

export type ColorField = ColorChannelField | ColorTextField;

const channel = (
  key: string,
  label: string,
  space: "rgba" | "hsla",
  name: ColorChannelName,
  max: number,
): ColorChannelField => ({
  kind: "channel",
  key,
  label,
  space,
  channel: name,
  min: 0,
  max,
  step: 1,
  places: 0,
});

/**
 * Alpha, which needs no conversion and is the only channel printed to two
 * places — it runs 0–1 rather than over a byte or a percentage.
 */
const ALPHA: ColorChannelField = {
  kind: "channel",
  key: "alpha",
  label: "A",
  space: null,
  channel: "alpha",
  min: 0,
  max: 1,
  step: 0.01,
  places: 2,
};

/**
 * OKLCH is the one notation without an alpha field beside it: `L C H / A`
 * carries its own, so it takes the whole row it would otherwise have shared.
 * At this width it needs it.
 */
export const COLOR_NOTATION_FIELDS: Record<ColorNotation, ColorField[]> = {
  hex: [{ kind: "text", key: "hex", label: "HEX" }, ALPHA],
  rgb: [
    channel("r", "R", "rgba", "red", 255),
    channel("g", "G", "rgba", "green", 255),
    channel("b", "B", "rgba", "blue", 255),
    ALPHA,
  ],
  hsl: [
    channel("h", "H", "hsla", "hue", 360),
    channel("s", "S", "hsla", "saturation", 100),
    channel("l", "L", "hsla", "lightness", 100),
    ALPHA,
  ],
  oklch: [{ kind: "text", key: "oklch", label: "OKLCH" }],
};

/**
 * Reads what a person types into the hex field into a `#rrggbb` string, or
 * `null` for anything that is not one. The leading `#` is optional, because
 * half the world types a hex colour without it, and a three-digit form is
 * expanded here so callers only ever handle the long one.
 */
export function normalizeHex(input: string): string | null {
  const trimmed = input.trim();
  const body = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(body)) return null;
  const long =
    body.length === 3
      ? body
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : body;
  return `#${long.toLowerCase()}`;
}

/**
 * Reads a number typed into a numeric channel, clamped to the field's own
 * range. `null` rejects the edit, and the field falls back to the colour it was
 * showing rather than guessing at what was meant.
 */
export function readChannelInput(text: string, field: ColorChannelField): number | null {
  if (text.trim() === "") return null;
  const value = Number(text);
  if (Number.isNaN(value)) return null;
  return Math.min(field.max, Math.max(field.min, value));
}

/** Rounds a channel for display at the precision its field prints. */
export function formatChannel(value: number, field: ColorChannelField): string {
  return String(Number(value.toFixed(field.places)));
}
