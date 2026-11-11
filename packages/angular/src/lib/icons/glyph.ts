/**
 * The components' own glyphs — Alert's dismiss, Select's chevron — as values
 * that can go anywhere an icon name can.
 *
 * @internal Users name icons the way their library does; see `SystemGlyph` in
 * @ui-organized/core for why the components alone need a library-neutral key.
 *
 * Angular passes icons around as strings (`[icon]` on a button ends up as
 * `[name]` on `uioIcon`), and a string is read as a native name. So a glyph is
 * a branded object instead: no string can be mistaken for one, and `UioIcon`
 * resolves it against whichever library the provider has active.
 */

import type { SystemGlyph } from "@ui-organized/core";

const BRAND = Symbol.for("@ui-organized/angular.glyph");

/** One of the components' own glyphs. Only `glyph()` makes one. */
export interface IconGlyph {
  readonly [BRAND]: SystemGlyph;
}

const GLYPHS = new Map<SystemGlyph, IconGlyph>();

export function glyph(name: SystemGlyph): IconGlyph {
  let value = GLYPHS.get(name);
  if (!value) {
    value = Object.freeze({ [BRAND]: name });
    GLYPHS.set(name, value);
  }
  return value;
}

/** The glyph a value stands for, or undefined for a native name. */
export function glyphOf(value: unknown): SystemGlyph | undefined {
  return typeof value === "object" && value !== null && BRAND in value
    ? (value as IconGlyph)[BRAND]
    : undefined;
}
