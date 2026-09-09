/**
 * Reading and writing one field of the notation row.
 *
 * The half of a field that `COLOR_NOTATION_FIELDS` in `@ui-organized/core`
 * cannot describe, because it needs a colour object and the four libraries do
 * not share one — the three Ark packages pass around `@zag-js/color-utils`
 * `Color`s and Angular computes its own. Core names the channel, its space and
 * its range; these two functions fetch and set it.
 *
 * Deliberately not Ark's `ChannelInput`: Ark writes a channel by converting the
 * colour to the *machine's* format first, so an HSL field would only work while
 * the machine is in `hsla` — which would mean flipping the notation select had
 * to reformat the machine, and the machine's format is what decides the value
 * string, the hidden input's form value and whether the picker area is
 * saturation×brightness or saturation×lightness. A display control must not
 * move any of those, so the fields convert on their own. Reads and writes both
 * go through `toFormat`, so every notation works from any machine format, and
 * OKLCH — which the machine cannot represent at all — is one more entry in the
 * same table.
 */
import { parseColor, type Color } from "@ark-ui/vue";
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

/**
 * The parsed colour the machine holds. Named here rather than in the public
 * types so `ColorPickerProps` keeps its string-only surface — a caller never
 * handles one of these.
 */
export type ColorLike = Color;

const round = (n: number, places = 0) => Number(n.toFixed(places));

export function toRgba(color: ColorLike): Rgba {
  const rgb = color.toFormat("rgba");
  return {
    r: round(rgb.getChannelValue("red")),
    g: round(rgb.getChannelValue("green")),
    b: round(rgb.getChannelValue("blue")),
    a: rgb.getChannelValue("alpha"),
  };
}

/** `space: null` is alpha — the one channel that survives a conversion. */
const inSpace = (color: ColorLike, field: ColorChannelField) =>
  field.space ? color.toFormat(field.space) : color;

export function readField(field: ColorField, color: ColorLike): string {
  if (field.kind === "channel") {
    return formatChannel(inSpace(color, field).getChannelValue(field.channel), field);
  }
  return field.key === "hex" ? color.toString("hex") : formatOklchComponents(toRgba(color));
}

/**
 * `null` rejects the edit, and the field falls back to the colour it was
 * showing rather than guessing at what was meant.
 */
export function writeField(field: ColorField, text: string, color: ColorLike): ColorLike | null {
  if (field.kind === "channel") {
    const value = readChannelInput(text, field);
    if (value === null) return null;
    return inSpace(color, field).withChannelValue(field.channel, value);
  }

  if (field.key === "hex") {
    const hex = normalizeHex(text);
    if (!hex) return null;
    /* Alpha deliberately survives a hex edit rather than being reset to opaque
       by a six-digit string. The field beside this one owns alpha; typing a
       colour is not a statement about transparency. */
    return parseColor(hex).withChannelValue("alpha", color.getChannelValue("alpha"));
  }

  const parsed = parseOklch(text);
  if (!parsed) return null;
  return parseColor(`rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a})`);
}
