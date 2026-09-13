import type { ElementProps, TableStyle } from "@ui-organized/table-core";

/**
 * The properties whose numeric values are **not** lengths.
 *
 * React appends `px` to every numeric style value except a known unitless list;
 * Vue appends nothing at all. Core's `TableStyle` is narrow enough that the
 * whole unitless list is one property — but writing it as an exception rather
 * than special-casing the seven lengths means a length added to `TableStyle`
 * later gets its unit automatically, and only a genuinely unitless one has to
 * touch this file.
 */
const UNITLESS = new Set<keyof TableStyle>(["zIndex"]);

/**
 * The one translation at the framework boundary.
 *
 * Core returns plain objects of `className` / `style` / `aria-*` / `data-*`,
 * typed against its own narrow `TableStyle` rather than any framework's — which
 * it cannot name without importing one. React's adapter needs only a cast. Vue
 * needs three things done to it, and the third is the one that bites:
 *
 * 1. **`className` → `class`**, which is what `v-bind` spells it.
 * 2. **`tabIndex` and `colSpan` → their attribute names.** React renders those
 *    two for us; Vue's server renderer writes the key as given, and nothing
 *    lowercases it on the way out.
 * 3. **Numeric lengths get `px`.** React does this and Vue does not, so a column
 *    width of `180` reached the DOM as `width:180` — which is not a length, so
 *    every column silently fell back to auto and the whole `table-layout: fixed`
 *    contract came apart. It is invisible to the parity gate, which does not
 *    compare `style`, and obvious the moment anyone looks at the table.
 *
 * Everything else passes through untouched: `aria-*` and `data-*` are already
 * attribute names.
 */
export function vueProps(props: ElementProps): Record<string, unknown> {
  const { className, tabIndex, colSpan, style, ...rest } = props;
  return {
    ...rest,
    ...(className === undefined ? {} : { class: className }),
    ...(tabIndex === undefined ? {} : { tabindex: tabIndex }),
    ...(colSpan === undefined ? {} : { colspan: colSpan }),
    ...(style === undefined ? {} : { style: withUnits(style) }),
  };
}

function withUnits(style: TableStyle): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(style)) {
    out[key] =
      typeof value === "number" && !UNITLESS.has(key as keyof TableStyle) ? `${value}px` : value;
  }
  return out;
}
