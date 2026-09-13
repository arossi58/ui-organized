import type { ElementProps, TableStyle } from "@ui-organized/table-core";

/**
 * The one translation at the framework boundary.
 *
 * Core returns plain objects of `className` / `style` / `aria-*` / `data-*`,
 * typed against its own narrow `TableStyle` rather than any framework's. Svelte
 * needs two things done to them, and the second is the one that bites:
 *
 * 1. **`className` → `class`**, which is what a spread onto an element wants.
 * 2. **Numeric lengths get `px`, and `style` becomes a string.** React appends
 *    the unit for us; Svelte does not, and a spread `style` has to be a string
 *    rather than an object. A column width of `180` would otherwise reach the
 *    DOM as `width:180`, which is not a length — so every column falls back to
 *    auto and the whole `table-layout: fixed` contract comes apart. It is
 *    invisible to the parity gate, which does not compare `style`, and obvious
 *    the moment anyone looks at the table. `@ui-organized/vue-table` hit exactly
 *    this.
 *
 * Everything else passes through untouched: `aria-*` and `data-*` are already
 * attribute names, and Svelte lowercases `tabIndex` and `colSpan` itself.
 */

/**
 * The properties whose numeric values are **not** lengths. Core's `TableStyle`
 * is narrow enough that the whole unitless list is one property — written as an
 * exception so a length added later gets its unit automatically.
 */
const UNITLESS = new Set<keyof TableStyle>(["zIndex"]);

/** `{ width: 180 }` → `"width: 180px"`. Empty style becomes `undefined`. */
function styleString(style: TableStyle): string | undefined {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(style)) {
    if (value === undefined) continue;
    const property = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    const unit = typeof value === "number" && !UNITLESS.has(key as keyof TableStyle) ? "px" : "";
    parts.push(`${property}: ${value}${unit}`);
  }
  return parts.length ? parts.join("; ") : undefined;
}

export function svelteProps(props: ElementProps): Record<string, unknown> {
  const { className, style, ...rest } = props;
  return {
    ...rest,
    ...(className === undefined ? {} : { class: className }),
    ...(style === undefined ? {} : { style: styleString(style) }),
  };
}
