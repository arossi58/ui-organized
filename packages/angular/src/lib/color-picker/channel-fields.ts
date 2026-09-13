/**
 * Reading and writing one field of the notation row.
 *
 * The half of a field that `COLOR_NOTATION_FIELDS` in `@ui-organized/core`
 * cannot describe, because it needs a colour and the four libraries do not
 * share one — the three Ark packages pass around `@zag-js/color-utils` `Color`s
 * and this one computes `ColorValue`s in `color.ts`. Core names the channel,
 * its space and its range; these two functions fetch and set it.
 *
 * The conversion on every read and write is the point, not an inefficiency: a
 * field must work from whatever space the picker is holding the colour in, so
 * an HSL field can be typed into while the machine is in rgba. Flipping the
 * notation select is a way of *reading* the colour, and moving the picker's own
 * format would move the value string, the form value and which pair of channels
 * the area is — see the note on `format` in `color-picker.ts`.
 */
import {
  formatChannel,
  formatOklchComponents,
  normalizeHex,
  parseOklch,
  readChannelInput,
  type ColorChannelField,
  type ColorField,
  type Rgba,
} from "@ui-organized/core";
import {
  colorToString,
  parseColor,
  roundTo,
  toColorFormat,
  withChannelValue,
  channelValue,
  type ColorValue,
} from "./color.js";

/** The colour as 8-bit sRGB, which is the form the OKLCH maths works in. */
export function toRgba(color: ColorValue): Rgba {
  const rgb = toColorFormat(color, "rgba");
  return {
    r: roundTo(channelValue(rgb, "red")),
    g: roundTo(channelValue(rgb, "green")),
    b: roundTo(channelValue(rgb, "blue")),
    a: channelValue(rgb, "alpha"),
  };
}

/** `space: null` is alpha — the one channel that survives a conversion. */
const inSpace = (color: ColorValue, field: ColorChannelField) =>
  field.space ? toColorFormat(color, field.space) : color;

export function readField(field: ColorField, color: ColorValue): string {
  if (field.kind === "channel") {
    return formatChannel(channelValue(inSpace(color, field), field.channel), field);
  }
  return field.key === "hex" ? colorToString(color, "hex") : formatOklchComponents(toRgba(color));
}

/**
 * `null` rejects the edit, and the field falls back to the colour it was
 * showing rather than guessing at what was meant.
 */
export function writeField(
  field: ColorField,
  text: string,
  color: ColorValue,
): ColorValue | null {
  if (field.kind === "channel") {
    const value = readChannelInput(text, field);
    if (value === null) return null;
    return withChannelValue(inSpace(color, field), field.channel, value);
  }

  if (field.key === "hex") {
    const hex = normalizeHex(text);
    if (!hex) return null;
    /* Alpha deliberately survives a hex edit rather than being reset to opaque
       by a six-digit string. The field beside this one owns alpha; typing a
       colour is not a statement about transparency. */
    return withChannelValue(parseColor(hex), "alpha", channelValue(color, "alpha"));
  }

  const parsed = parseOklch(text);
  if (!parsed) return null;
  return parseColor(`rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a})`);
}
