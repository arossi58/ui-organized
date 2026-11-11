/**
 * The components' own glyphs — Alert's dismiss, Select's chevron — as values
 * that can go anywhere an icon component can.
 *
 * @internal Never exported from the package. Users name icons the way their
 * library does; see `SystemGlyph` in @ui-organized/core for why the components
 * alone need a library-neutral key.
 *
 * A glyph has to pass through `icon` props (`<IconButton icon={glyph("close")}>`)
 * as well as `<Icon name>`, and those accept a string or a component. A string
 * would be read as a native name, so a glyph is a component, recognised by
 * `Icon` and resolved against whichever library the provider has active. It
 * renders nothing on its own: the active library decides what it looks like.
 */

import type { ComponentType } from "react";
import type { SystemGlyph } from "@ui-organized/core";

const GLYPHS = new Map<SystemGlyph, ComponentType<any>>();
const GLYPH_OF = new WeakMap<object, SystemGlyph>();

export function glyph(name: SystemGlyph): ComponentType<any> {
  let component = GLYPHS.get(name);
  if (!component) {
    const Glyph = () => null;
    Glyph.displayName = `Glyph(${name})`;
    component = Glyph;
    GLYPHS.set(name, component);
    GLYPH_OF.set(component, name);
  }
  return component;
}

/** The glyph a value stands for, or undefined if it is an ordinary component. */
export function glyphOf(value: unknown): SystemGlyph | undefined {
  return typeof value === "function" || (typeof value === "object" && value !== null)
    ? GLYPH_OF.get(value)
    : undefined;
}
