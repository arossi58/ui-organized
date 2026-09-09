/**
 * A fake icon library, so `Icon` can be compared at all.
 *
 * `Icon` renders nothing until an icon set is registered, and the parity suite
 * registered none — so every framework rendered nothing and every Icon case
 * passed by rendering nothing on both sides. The component with the widest
 * reach in the system was the one the gate said least about.
 *
 * A real library cannot be used here: `lucide-react`, `@lucide/svelte` and
 * `lucide-vue-next` are three different packages whose SVG output is their own
 * business, and comparing them would compare Lucide against itself rather than
 * our three `Icon` implementations against each other. What *is* ours is
 * everything that happens before the icon component is reached — reading the
 * provider config, resolving the canonical name, picking the outline or solid
 * cut, and computing the optical stroke — and all of it is shared code in
 * `@ui-organized/core` that each framework has to call correctly.
 *
 * So the stub takes the two numbers our adapters produce and renders them as
 * attributes. If a framework reads the wrong `style`, resolves the wrong cut,
 * or applies the stroke curve differently, the numbers differ and the case
 * fails.
 */

import type { IconSet } from "@ui-organized/core";

/**
 * Deliberately the same shape core falls back to for a directly-supplied icon
 * component (`{ size, strokeWidth }`), so the registered path and the supplied
 * path hand the stub identical props and one component covers both.
 *
 * `strokeWidth` is omitted rather than passed as undefined when there is no
 * stroke — solid icons have none — which is itself worth comparing: all three
 * renderers must drop the attribute rather than print "undefined".
 */
export function stubSvgProps(size: number, stroke: number | undefined): Record<string, unknown> {
  return { size, ...(stroke !== undefined ? { strokeWidth: stroke } : {}) };
}

/**
 * `close` has an outline cut but no solid one, which is the case that matters:
 * Lucide ships no solid set at all, so `resolveIconComponent`'s fall back to
 * outline is the normal path rather than an edge case. `star` is registered in
 * neither, so "this library has no icon for that name" is covered too.
 *
 * The four status names are here so that components which pick an icon *for*
 * you — Alert maps its variant to one — render something rather than matching
 * two absences. Note what that still does not cover: one stub component serves
 * every name, so a library mapping `warning` to the wrong glyph looks identical.
 * Distinguishing names would need a separate stub per name in all four
 * libraries, since a component cannot know which name resolved to it.
 */
export function makeStubIconSet<T>(
  outline: T,
  solid: T,
  /**
   * Overridden by Angular alone.
   *
   * The other three store a stub *component*, which maps `{ size, strokeWidth }`
   * onto `data-size`/`data-stroke` in its own template. An Angular icon is
   * markup, so there is no component to do the mapping and it moves into the
   * adapter — which is exactly where a real Angular adapter puts it too. Same
   * two numbers, same rendered attributes, one layer further out.
   */
  svgProps: IconSet<T>["svgProps"] = stubSvgProps,
): IconSet<T> {
  return {
    library: "lucide",
    outline: {
      check: outline,
      close: outline,
      info: outline,
      "check-circle": outline,
      "alert-triangle": outline,
      "alert-circle": outline,
    },
    solid: { check: solid },
    svgProps,
  };
}
